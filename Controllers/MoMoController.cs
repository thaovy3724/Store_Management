using Microsoft.AspNetCore.Mvc;
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

                // Validate config
                if (string.IsNullOrEmpty(partnerCode) || string.IsNullOrEmpty(secretKey))
                {
                    return BadRequest(new { error = "MoMo configuration missing" });
                }

                // Tạo request data
                string requestId = Guid.NewGuid().ToString();
                string orderIdStr = orderId.ToString();
                string amountStr = ((long)amount).ToString();
                string orderInfoStr = orderInfo ?? $"Thanh toan don hang {orderId}";
                string extraData = ""; // Có thể để trống hoặc base64 encode JSON
                string ipAddr = GetIpAddress();

                // Tạo rawSignature theo thứ tự alphabet (quan trọng!)
                string rawSignature = $"accessKey={accessKey}" +
                                    $"&amount={amountStr}" +
                                    $"&extraData={extraData}" +
                                    $"&ipnUrl={ipnUrl}" +
                                    $"&orderId={orderIdStr}" +
                                    $"&orderInfo={orderInfoStr}" +
                                    $"&partnerCode={partnerCode}" +
                                    $"&redirectUrl={returnUrl}" +
                                    $"&requestId={requestId}" +
                                    $"&requestType={requestType}";


                // Tạo signature
                string signature = CreateSignature(secretKey, rawSignature);

                // Tạo request body
                var requestData = new
                {
                    partnerCode,
                    accessKey,
                    requestId,
                    amount = amountStr,
                    orderId = orderIdStr,
                    orderInfo = orderInfoStr,
                    redirectUrl = returnUrl,
                    ipnUrl,
                    extraData,
                    requestType,
                    signature,
                    lang = "vi"
                };

                var jsonContent = JsonSerializer.Serialize(requestData);

                // Gửi request đến MoMo
                var httpClient = _httpClientFactory.CreateClient();
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(endpoint, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                // Parse response
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

                // Log tất cả params
                foreach (var key in momoData.Keys)
                {
                    Console.WriteLine($"{key} = {momoData[key]}");
                }

                // Lấy thông tin từ query
                string partnerCode = momoData["partnerCode"];
                string orderId = momoData["orderId"];
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

                // Tạo signature để verify
                string rawSignature = $"accessKey={_config["MoMo:AccessKey"]}" +
                                    $"&amount={amount}" +
                                    $"&extraData={extraData}" +
                                    $"&message={message}" +
                                    $"&orderId={orderId}" +
                                    $"&orderInfo={orderInfo}" +
                                    $"&orderType={orderType}" +
                                    $"&partnerCode={partnerCode}" +
                                    $"&payType={payType}" +
                                    $"&requestId={requestId}" +
                                    $"&responseTime={responseTime}" +
                                    $"&resultCode={resultCode}" +
                                    $"&transId={transId}";

                string calculatedSignature = CreateSignature(secretKey, rawSignature);

                // Verify signature
                if (calculatedSignature != receivedSignature)
                {
                    return BadRequest("Chữ ký không hợp lệ!");
                }

                // Kiểm tra kết quả thanh toán
                if (resultCode == "0")
                {
                    // TODO: Cập nhật database
                    var order = _context.Orders.FirstOrDefault(o => o.OrderId == int.Parse(orderId));
                    order.Status = (Models.Entities.OrderStatus)1;
                    _context.SaveChanges();

                    return Redirect($"/OrderStaff?paymentSuccess=true&orderId={orderId}");
                }
                else
                {
                    // TODO: Cập nhật database
                    var order = _context.Orders.FirstOrDefault(o => o.OrderId == int.Parse(orderId));
                    order.Status = (Models.Entities.OrderStatus)2;
                    _context.SaveChanges();

                    return Redirect($"/OrderStaff?paymentSuccess=false");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error processing return: {ex.Message}");
                Console.WriteLine("=== END CALLBACK ===\n");
                return StatusCode(500, "Internal server error");
            }
        }

        // 🔹 IPN (Instant Payment Notification) - MoMo gọi webhook
        [HttpPost("/momo-ipn")]
        public IActionResult MoMoIPN([FromBody] JsonElement ipnData)
        {
            try
            {
                Console.WriteLine("\n=== MOMO IPN CALLBACK ===");
                Console.WriteLine(ipnData.GetRawText());

                string secretKey = _config["MoMo:SecretKey"];

                // Lấy data từ body
                string partnerCode = ipnData.GetProperty("partnerCode").GetString();
                string orderId = ipnData.GetProperty("orderId").GetString();
                string requestId = ipnData.GetProperty("requestId").GetString();
                string amount = ipnData.GetProperty("amount").GetString();
                string orderInfo = ipnData.GetProperty("orderInfo").GetString();
                string orderType = ipnData.GetProperty("orderType").GetString();
                string transId = ipnData.GetProperty("transId").GetString();
                string resultCode = ipnData.GetProperty("resultCode").GetString();
                string message = ipnData.GetProperty("message").GetString();
                string payType = ipnData.GetProperty("payType").GetString();
                string responseTime = ipnData.GetProperty("responseTime").GetString();
                string extraData = ipnData.GetProperty("extraData").GetString();
                string receivedSignature = ipnData.GetProperty("signature").GetString();

                // Verify signature
                string rawSignature = $"accessKey={_config["MoMo:AccessKey"]}" +
                                    $"&amount={amount}" +
                                    $"&extraData={extraData}" +
                                    $"&message={message}" +
                                    $"&orderId={orderId}" +
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
                    Console.WriteLine("IPN: Chữ ký không hợp lệ!");
                    return BadRequest(new { message = "Invalid signature" });
                }

                // Xử lý IPN
                if (resultCode == "0")
                {
                    Console.WriteLine($"✅ IPN: Thanh toán thành công - OrderId: {orderId}");
                    
                    // TODO: Cập nhật database
                    // UpdateOrderStatus(orderId, "Paid", transId);
                }
                else
                {
                    Console.WriteLine($"❌ IPN: Thanh toán thất bại - OrderId: {orderId}, Code: {resultCode}");
                }

                Console.WriteLine("=== END IPN ===\n");

                // Phải trả về status 204 để MoMo biết đã nhận IPN
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing IPN: {ex.Message}");
                return StatusCode(500);
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