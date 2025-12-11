using Microsoft.AspNetCore.Mvc;
using StoreManagement.Data;
using StoreManagement.Models.Entities;
using StoreManagement.Models.ViewModel.Utils;

namespace StoreManagement.Controllers
{
    public class VNPayController : Controller
    {
        private readonly IConfiguration _config;
        private readonly ApplicationDbContext _context;

        public VNPayController(IConfiguration config, ApplicationDbContext context)
        {
            _config = config;
            _context = context;
        }

        // 🔹 API tạo payment URL VNPay
        [HttpGet("/vnpay-payment")]
        public IActionResult CreateVNPayPayment(int orderId, decimal amount, string orderInfo = null)
        {
            try
            {
                // Validate config
                if (string.IsNullOrEmpty(_config["VnPay:TmnCode"]) || 
                    string.IsNullOrEmpty(_config["VnPay:HashSecret"]))
                {
                    return Json(new { success = false, error = "VNPay configuration missing" });
                }

                var vnpay = new VnPayLibrary();

                vnpay.AddRequestData("vnp_Version", _config["VnPay:Version"]);
                vnpay.AddRequestData("vnp_Command", _config["VnPay:Command"]);
                vnpay.AddRequestData("vnp_TmnCode", _config["VnPay:TmnCode"]);
                vnpay.AddRequestData("vnp_Amount", ((long)(amount * 100)).ToString());
                vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
                vnpay.AddRequestData("vnp_CurrCode", _config["VnPay:CurrCode"]);
                vnpay.AddRequestData("vnp_IpAddr", UtilsVNPay.GetIpAddress(HttpContext));
                vnpay.AddRequestData("vnp_Locale", _config["VnPay:Locale"]);
                vnpay.AddRequestData("vnp_OrderInfo", orderInfo ?? $"Thanh toan don hang {orderId}");
                vnpay.AddRequestData("vnp_OrderType", "other");
                vnpay.AddRequestData("vnp_ReturnUrl", _config["VnPay:PaymentBackReturnUrl"]);
                vnpay.AddRequestData("vnp_TxnRef", orderId.ToString());

                string paymentUrl = vnpay.CreateRequestUrl(_config["VnPay:BaseUrl"], _config["VnPay:HashSecret"]);
                
                Console.WriteLine($"✅ VNPay Payment URL created for Order #{orderId}");
                Console.WriteLine(paymentUrl);

                return Json(new
                {
                    success = true,
                    paymentUrl = paymentUrl,
                    message = "Tạo payment thành công"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ VNPay Error: {ex.Message}");
                return Json(new { success = false, error = "Internal server error", message = ex.Message });
            }
        }

        // 🔹 Callback khi user thanh toán xong (ReturnUrl)
        [HttpGet("/vnpay-return")]
        public IActionResult VNPayReturn()
        {
            try
            {
                Console.WriteLine("\n=== VNPAY RETURN CALLBACK ===");

                var vnpay = new VnPayLibrary();
                
                // Log và thêm response data
                foreach (var (key, value) in Request.Query)
                {
                    Console.WriteLine($"{key} = {value}");
                    if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                        vnpay.AddResponseData(key, value.ToString());
                }

                // Lấy thông tin từ response
                var txnRef = vnpay.GetResponseData("vnp_TxnRef");
                var transactionNo = vnpay.GetResponseData("vnp_TransactionNo");
                var responseCode = vnpay.GetResponseData("vnp_ResponseCode");
                var secureHash = Request.Query["vnp_SecureHash"].ToString();

                // Verify signature
                bool checkSignature = vnpay.ValidateSignature(secureHash, _config["VnPay:HashSecret"]);

                if (!checkSignature)
                {
                    Console.WriteLine("❌ Chữ ký không hợp lệ!");
                    Console.WriteLine("=== END CALLBACK ===\n");
                    return BadRequest("Chữ ký không hợp lệ!");
                }

                // Tìm đơn hàng
                var order = _context.Orders.FirstOrDefault(o => o.OrderId == int.Parse(txnRef));
                if (order == null)
                {
                    Console.WriteLine($"❌ Không tìm thấy đơn hàng #{txnRef}");
                    Console.WriteLine("=== END CALLBACK ===\n");
                    return BadRequest("Không tìm thấy đơn hàng.");
                }

                // Kiểm tra kết quả thanh toán
                if (responseCode == "00")
                {
                    Console.WriteLine($"✅ Thanh toán thành công - OrderId: {txnRef}, TransactionNo: {transactionNo}");
                    
                    order.Status = OrderStatus.Paid;
                    _context.SaveChanges();

                    Console.WriteLine("=== END CALLBACK ===\n");
                    return Redirect($"/OrderStaff?paymentSuccess=true&orderId={order.OrderId}");
                }
                else
                {
                    Console.WriteLine($"❌ Thanh toán thất bại - OrderId: {txnRef}, ResponseCode: {responseCode}");
                    
                    // Thêm logic hoàn lại tồn kho
                    RestoreInventory(order.OrderId);

                    order.Status = OrderStatus.Cancelled;
                    _context.SaveChanges();

                    Console.WriteLine("=== END CALLBACK ===\n");
                    return Redirect($"/OrderStaff?paymentSuccess=false&orderId={order.OrderId}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error processing return: {ex.Message}");
                Console.WriteLine("=== END CALLBACK ===\n");
                return StatusCode(500, "Internal server error");
            }
        }

        // 🔹 Test endpoint
        [HttpGet("/vnpay-test")]
        public IActionResult TestConfig()
        {
            return Json(new
            {
                tmnCode = _config["VnPay:TmnCode"],
                baseUrl = _config["VnPay:BaseUrl"],
                returnUrl = _config["VnPay:PaymentBackReturnUrl"],
                message = "VNPay configuration loaded"
            });
        }

        // 🔹 Phục hồi tồn kho cho đơn hàng
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
    }
}