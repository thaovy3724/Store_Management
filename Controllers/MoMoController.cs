using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using StoreManagement.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace StoreManagement.Controllers
{

    [Route("[controller]")]
    public class MoMoController : Controller
    {
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ApplicationDbContext _context;

        public MoMoController(IConfiguration config, IHttpClientFactory httpClientFactory, ApplicationDbContext context)
        {
            _config = config;
            _httpClientFactory = httpClientFactory;
            _context = context;
        }

        // 🔹 Tạo chữ ký HMAC SHA256
        private string CreateSignature(string secretKey, string data)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
            byte[] hashValue = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hashValue).Replace("-", "").ToLower();
        }

        // 🔹 Lấy IP address
        private string GetIpAddress()
        {
            try
            {
                var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
                if (!string.IsNullOrEmpty(forwardedFor))
                {
                    var ips = forwardedFor.Split(',');
                    if (ips.Length > 0)
                    {
                        var ip = ips[0].Trim();
                        if (ip != "unknown" && ip.Length <= 45)
                            return ip;
                    }
                }

                var remoteIp = HttpContext.Connection.RemoteIpAddress;
                if (remoteIp == null) return "127.0.0.1";
                if (remoteIp.ToString() == "::1") return "127.0.0.1";
                if (remoteIp.IsIPv4MappedToIPv6) return remoteIp.MapToIPv4().ToString();

                return remoteIp.ToString();
            }
            catch
            {
                return "127.0.0.1";
            }
        }

        // 🔹 Hoàn lại tồn kho khi thanh toán thất bại
        private void RestoreInventory(int orderId)
        {
            var orderItems = _context.OrderItems
                .Where(oi => oi.OrderId == orderId)
                .ToList();

            foreach (var item in orderItems)
            {
                var inventory = _context.Inventories
                    .FirstOrDefault(i => i.ProductId == item.ProductId);

                if (inventory != null)
                {
                    inventory.Quantity += item.Quantity;
                    inventory.UpdatedAt = DateTime.Now;
                    Console.WriteLine($"✅ Hoàn kho: ProductId={item.ProductId}, Quantity=+{item.Quantity}");
                }
            }
        }

        // 🔹 API tạo payment request MoMo
        [HttpGet("/momo-payment")]
        public async Task<IActionResult> CreateMoMoPayment(int orderId, decimal amount, string orderInfo = null)
        {
            try
            {
                string partnerCode = _config["MoMo:PartnerCode"];
                string accessKey = _config["MoMo:AccessKey"];
                string secretKey = _config["MoMo:SecretKey"];
                string endpoint = _config["MoMo:Endpoint"];
                string returnUrl = _config["MoMo:ReturnUrl"];
                string ipnUrl = _config["MoMo:IpnUrl"];
                string requestType = _config["MoMo:RequestType"] ?? "captureWallet";

                if (string.IsNullOrEmpty(partnerCode) || string.IsNullOrEmpty(secretKey))
                {
                    return BadRequest(new { error = "MoMo configuration missing" });
                }

                string requestId = Guid.NewGuid().ToString();
                
                // ✅ MoMo orderId = "1_20251216153045" (duy nhất mỗi lần gọi)
                // ✅ Database orderId vẫn là 1, 2, 3, 4, 5, 6...
                string momoOrderId = $"{orderId}_{DateTime.Now:yyyyMMddHHmmss}";
                
                string amountStr = ((long)amount).ToString();
                string orderInfoStr = orderInfo ?? $"Thanh toan don hang {orderId}";
                string extraData = ""; // Để trống, lấy orderId từ momoOrderId

                string rawSignature = $"accessKey={accessKey}" +
                                    $"&amount={amountStr}" +
                                    $"&extraData={extraData}" +
                                    $"&ipnUrl={ipnUrl}" +
                                    $"&orderId={momoOrderId}" +
                                    $"&orderInfo={orderInfoStr}" +
                                    $"&partnerCode={partnerCode}" +
                                    $"&redirectUrl={returnUrl}" +
                                    $"&requestId={requestId}" +
                                    $"&requestType={requestType}";

                string signature = CreateSignature(secretKey, rawSignature);

                var requestData = new
                {
                    partnerCode,
                    accessKey,
                    requestId,
                    amount = amountStr,
                    orderId = momoOrderId,
                    orderInfo = orderInfoStr,
                    redirectUrl = returnUrl,
                    ipnUrl,
                    extraData,
                    requestType,
                    signature,
                    lang = "vi"
                };

                var jsonContent = JsonSerializer.Serialize(requestData);
                
                Console.WriteLine($"✅ MoMo: DB OrderId={orderId}, MoMo OrderId={momoOrderId}");

                var httpClient = _httpClientFactory.CreateClient();
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(endpoint, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                var momoResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);

                if (momoResponse.TryGetProperty("resultCode", out var resultCode) && 
                    resultCode.GetInt32() == 0)
                {
                    string payUrl = momoResponse.GetProperty("payUrl").GetString();
                    
                    return Json(new
                    {
                        success = true,
                        paymentUrl = payUrl,
                        message = "Tạo payment thành công"
                    });
                }
                else
                {
                    string message = momoResponse.TryGetProperty("message", out var msg) 
                        ? msg.GetString() 
                        : "Unknown error";
                    
                    return BadRequest(new
                    {
                        success = false,
                        error = message,
                        resultCode = resultCode.GetInt32()
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }

        // 🔹 Callback khi user thanh toán xong (ReturnUrl)
        [HttpGet("/momo-return")]
        public IActionResult MoMoReturn()
        {
            try
            {
                Console.WriteLine("\n=== MOMO RETURN CALLBACK ===");

                string secretKey = _config["MoMo:SecretKey"];
                var momoData = Request.Query;

                foreach (var key in momoData.Keys)
                {
                    Console.WriteLine($"{key} = {momoData[key]}");
                }

                string partnerCode = momoData["partnerCode"];
                string momoOrderId = momoData["orderId"];  // VD: "5_20251216153045"
                string requestId = momoData["requestId"];
                string amount = momoData["amount"];
                string orderInfo = momoData["orderInfo"];
                string orderType = momoData["orderType"];
                string transId = momoData["transId"];
                string resultCode = momoData["resultCode"];
                string message = momoData["message"];
                string payType = momoData["payType"];
                string responseTime = momoData["responseTime"];
                string extraData = momoData["extraData"];
                string receivedSignature = momoData["signature"];

                string rawSignature = $"accessKey={_config["MoMo:AccessKey"]}" +
                                    $"&amount={amount}" +
                                    $"&extraData={extraData}" +
                                    $"&message={message}" +
                                    $"&orderId={momoOrderId}" +
                                    $"&orderInfo={orderInfo}" +
                                    $"&orderType={orderType}" +
                                    $"&partnerCode={partnerCode}" +
                                    $"&payType={payType}" +
                                    $"&requestId={requestId}" +
                                    $"&responseTime={responseTime}" +
                                    $"&resultCode={resultCode}" +
                                    $"&transId={transId}";

                string calculatedSignature = CreateSignature(secretKey, rawSignature);

                if (calculatedSignature != receivedSignature)
                {
                    Console.WriteLine("❌ Chữ ký không hợp lệ!");
                    return BadRequest("Chữ ký không hợp lệ!");
                }

                // ✅ Lấy orderId gốc từ momoOrderId: "5_20251216153045" → 5
                int dbOrderId = int.Parse(momoOrderId.Split('_')[0]);
                Console.WriteLine($"✅ DB OrderId: {dbOrderId}");

                var order = _context.Orders.FirstOrDefault(o => o.OrderId == dbOrderId);

                if (order == null)
                {
                    Console.WriteLine($"❌ Không tìm thấy đơn hàng #{dbOrderId}");
                    return BadRequest("Không tìm thấy đơn hàng.");
                }

                if (resultCode == "0")
                {
                    order.Status = Models.Entities.OrderStatus.Paid;
                    _context.SaveChanges();

                    Console.WriteLine($"✅ Thanh toán thành công - OrderId: {dbOrderId}");
                    Console.WriteLine("=== END CALLBACK ===\n");

                    return Redirect($"/OrderStaff?paymentSuccess=true&orderId={dbOrderId}");
                }
                else
                {
                    Console.WriteLine($"❌ Thanh toán thất bại - OrderId: {dbOrderId}");

                    RestoreInventory(dbOrderId);

                    order.Status = Models.Entities.OrderStatus.Cancelled;
                    _context.SaveChanges();

                    Console.WriteLine("=== END CALLBACK ===\n");

                    return Redirect($"/OrderStaff?paymentSuccess=false&orderId={dbOrderId}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
                Console.WriteLine("=== END CALLBACK ===\n");
                return StatusCode(500, "Internal server error");
            }
        }

        // 🔹 Test endpoint
        [HttpGet("/momo-test")]
        public IActionResult TestSignature()
        {
            string secretKey = _config["MoMo:SecretKey"];
            string testData = "accessKey=F8BBA842ECF85&amount=50000&extraData=&ipnUrl=https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b&orderId=MM1415459000&orderInfo=pay with MoMo&partnerCode=MOMO&redirectUrl=https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b&requestId=MM1415459000&requestType=payWithATM";

            string signature = CreateSignature(secretKey, testData);

            return Json(new
            {
                secretKey,
                testData,
                signature,
                message = "Compare this signature with MoMo documentation"
            });
        }
    }
}