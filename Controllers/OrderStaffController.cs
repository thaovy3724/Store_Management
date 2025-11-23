using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models.Entities;
using StoreManagement.Models.ViewModel.OrderStaff;
using StoreManagement.Models.ViewModel.Utils;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Web;

namespace StoreManagement.Controllers
{
    public class OrderStaffController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public OrderStaffController(IConfiguration config,ApplicationDbContext context)
        {
            _config = config;
            _context = context;
        }

        [HttpGet]
        public IActionResult Index(
            int page = 1,
            int pageSize = 6,
            int? categoryId = null,
            string search = "")
        {
            // 1️⃣ Lấy danh mục (để hiển thị combobox lọc)
            var categories = _context.Categories.ToList();

            // 2️⃣ Tạo query cơ bản
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Inventory)
                .AsQueryable();

            // 3️⃣ Lọc theo tên sản phẩm (search)
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.ProductName.Contains(search));
            }

            // 4️⃣ Lọc theo danh mục
            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            // 5️⃣ Truy vấn danh sách sản phẩm (chưa phân trang)
            var productsList = query
                .OrderBy(p => p.ProductId)
                .Select(p => new OrderStaffLoadProductModel
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    ProductImage = p.ProductImage,
                    Price = p.Price,
                    Quantity = p.Inventory != null ? p.Inventory.Quantity : 0,
                    CategoryName = p.Category != null ? p.Category.CategoryName : ""
                })
                .ToList();

            // 6️⃣ Phân trang bằng lớp Pagination<T>
            var pagedProducts = Pagination<OrderStaffLoadProductModel>.Create(productsList, page, pageSize);

            // 7️⃣ Tạo ViewModel tổng hợp
            var viewModel = new OrderStaffLoadViewPageModel
            {
                Categories = categories,
                Products = pagedProducts.Items,
                CurrentPage = pagedProducts.CurrentPage,
                TotalPages = pagedProducts.TotalPages,
                Search = search,
                SelectedCategoryId = categoryId
            };

            return View(viewModel);
        }


        // GET: Lấy thông tin sản phẩm theo barcode
        [HttpGet]
        public async Task<IActionResult> GetProductByBarcode(string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
                return BadRequest(new { success = false, message = "Barcode không được để trống." });

            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Inventory)
                .Where(p => p.Barcode == barcode)
                .Select(p => new
                {
                    p.ProductId,
                    p.ProductName,
                    p.ProductImage,
                    p.Price,
                    p.Barcode,
                    CategoryName = p.Category != null ? p.Category.CategoryName : "",
                    Quantity = p.Inventory != null ? p.Inventory.Quantity : 0,
                    Unit = p.Unit
                })
                .FirstOrDefaultAsync();

            if (product == null)
                return Json(new { success = false, message = "Không tìm thấy sản phẩm với barcode này!" });

            return Json(new { success = true, data = product });
        }

        // GET: Tìm khách hàng theo số điện thoại
        [HttpGet]
        public async Task<IActionResult> SearchCustomer(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone)) return Json(new object[0]);

            var customers = await _context.Customers
                .Where(c => c.Phone.Contains(phone))
                .OrderBy(c => c.Name)
                .Take(10)
                .Select(c => new
                {
                    c.CustomerId,
                    c.Name,
                    c.Phone,
                    c.Email,
                    c.Address
                })
                .ToListAsync();

            return Json(customers);
        }
        // Lấy khuyến mãi phù hợp với giá trị đơn hàng
        [HttpGet]
        public IActionResult GetApplicablePromotionsValid(decimal orderTotal)
        {
            var promotions = _context.Promotions
                .Where(p => p.Status == PromotionStatus.Active
                            && p.EndDate >= DateTime.Now
                            && p.MinOrderAmount <= orderTotal
                            && p.UsageLimit > p.UsedCount)
                .Select(p => new OrderStaffLoadPromotionModel
                {
                    PromotionId = p.PromoId,
                    PromotionCode = p.PromoCode,
                    Description = p.Description,
                    DiscountValue = p.DiscountValue,
                    DiscountType = p.DiscountType,
                    EndDate = p.EndDate,
                    MinOrderAmount = p.MinOrderAmount
                })
                .ToList();

            return Json(promotions);
        }
        [HttpGet]
        public IActionResult GetApplicablePromotionsInValid(decimal orderTotal)
        {
            var promotions = _context.Promotions
                .Where(p => p.Status == PromotionStatus.Active
                            && p.EndDate >= DateTime.Now
                            && p.MinOrderAmount > orderTotal
                            && p.UsageLimit > p.UsedCount)
                .Select(p => new OrderStaffLoadPromotionModel
                {
                    PromotionId = p.PromoId,
                    PromotionCode = p.PromoCode,
                    Description = p.Description,
                    DiscountValue = p.DiscountValue,
                    DiscountType = p.DiscountType,
                    EndDate = p.EndDate,
                    MinOrderAmount = p.MinOrderAmount
                })
                .ToList();

            return Json(promotions);
        }
        // Thêm Order
        [HttpPost]
        public async Task<IActionResult> AddOrder([FromBody] AddOrderInputModel input)
        {
            Console.WriteLine("=== DỮ LIỆU NHẬN VỀ ===");
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(input));
            if (input == null || input.OrderItems == null || !input.OrderItems.Any())
                return BadRequest(new { success = false, message = "Dữ liệu đơn hàng không hợp lệ." });

            // 1️⃣ Kiểm tra khách hàng có tồn tại không
            var customer = await _context.Customers.FindAsync(input.CustomerId);
            if (customer == null)
                return Json(new { success = false, message = "Không tìm thấy khách hàng." });

            // 2️⃣ Nếu có khuyến mãi thì kiểm tra
            Promotion promo = null;
            if (input.PromoId.HasValue)
            {
                promo = await _context.Promotions.FirstOrDefaultAsync(p => p.PromoId == input.PromoId);
                if (promo == null || promo.Status != PromotionStatus.Active || promo.EndDate < DateTime.Now)
                    return Json(new { success = false, message = "Khuyến mãi không hợp lệ." });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 3️⃣ Tạo đơn hàng
                var order = new Order
                {
                    CustomerId = input.CustomerId,
                    UserId = input.UserId,
                    PromoId = input.PromoId,
                    OrderDate = DateTime.Now,
                    TotalAmount = input.TotalAmount,
                    DiscountAmount = input.DiscountAmount,
                    Status = input.OrderStatus
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // 4️⃣ Thêm các sản phẩm
                foreach (var item in input.OrderItems)
                {
                    var product = await _context.Products
                        .Include(p => p.Inventory)
                        .FirstOrDefaultAsync(p => p.ProductId == item.ProductId);

                    if (product == null)
                        throw new Exception($"Không tìm thấy sản phẩm ID {item.ProductId}");

                    if (product.Inventory == null || product.Inventory.Quantity < item.Quantity)
                        throw new Exception($"Sản phẩm '{product.ProductName}' không đủ tồn kho.");

                    // Trừ tồn kho
                    product.Inventory.Quantity -= item.Quantity;
                    product.Inventory.UpdatedAt = DateTime.Now;

                    // Tạo chi tiết đơn hàng
                    var orderItem = new OrderItem
                    {
                        OrderId = order.OrderId,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        Price = item.Price,
                        Subtotal = item.Price * item.Quantity
                    };

                    _context.OrderItems.Add(orderItem);
                }

                // 5️⃣ Tạo thanh toán
                var payment = new Payment
                {
                    OrderId = order.OrderId,
                    Amount = order.TotalAmount - order.DiscountAmount,
                    PaymentDate = DateTime.Now,
                    PaymentMethod = input.PaymentMethod
                };
                _context.Payments.Add(payment);

                // 6️⃣ Cập nhật khuyến mãi
                if (promo != null)
                {
                    promo.UsedCount += 1;
                    _context.Promotions.Update(promo);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Json(new { success = true, orderId = order.OrderId });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return Json(new { success = false, message = "Lỗi khi tạo đơn hàng: " + ex.Message });
            }
        }
        //VNPAY
        [HttpGet]
        public IActionResult VNPayPaymentUrl(int orderId, decimal amount)
        {
            var vnpay = new VnPayLibrary();

            vnpay.AddRequestData("vnp_Version", _config["VnPay:Version"]);
            vnpay.AddRequestData("vnp_Command", _config["VnPay:Command"]);
            vnpay.AddRequestData("vnp_TmnCode", _config["VnPay:TmnCode"]);
            vnpay.AddRequestData("vnp_Amount", (amount * 100).ToString());
            vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", _config["VnPay:CurrCode"]);
            vnpay.AddRequestData("vnp_IpAddr", UtilsVNPay.GetIpAddress(HttpContext));
            vnpay.AddRequestData("vnp_Locale", _config["VnPay:Locale"]);
            vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toán đơn hàng {orderId}");
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ReturnUrl", _config["VnPay:PaymentBackReturnUrl"]);
            vnpay.AddRequestData("vnp_TxnRef", orderId.ToString());

            string paymentUrl = vnpay.CreateRequestUrl(_config["VnPay:BaseUrl"], _config["VnPay:HashSecret"]);
            Console.WriteLine(paymentUrl);

            return Json(new { paymentUrl });
        }

        // Callback từ VNPay
        [HttpGet("/vnpay-return")]
        public IActionResult VNPayReturn()
        {
            var vnpay = new VnPayLibrary();
            foreach (var (key, value) in Request.Query)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                    vnpay.AddResponseData(key, value.ToString());
            }

            var txnRef = vnpay.GetResponseData("vnp_TxnRef");
            var transactionNo = vnpay.GetResponseData("vnp_TransactionNo");
            var responseCode = vnpay.GetResponseData("vnp_ResponseCode");
            var orderInfo = vnpay.GetResponseData("vnp_OrderInfo");
            var secureHash = Request.Query["vnp_SecureHash"].ToString();

            bool checkSignature = vnpay.ValidateSignature(secureHash, _config["VnPay:HashSecret"]);

            if (!checkSignature)
                return Content("Chữ ký không hợp lệ hoặc thanh toán thất bại");

            var order = _context.Orders.FirstOrDefault(o => o.OrderId == int.Parse(txnRef));
            if (order == null)
                return BadRequest("Không tìm thấy đơn hàng.");

            if (responseCode == "00")
            {
                order.Status = Models.Entities.OrderStatus.Paid;
                _context.SaveChanges();
                return Redirect($"/OrderStaff?paymentSuccess=true&orderId={order.OrderId}");
            }
            else
            {
                order.Status = Models.Entities.OrderStatus.Cancelled;
                _context.SaveChanges();
                return Redirect($"/OrderStaff?paymentSuccess=false&orderId={order.OrderId}");
            }
        }
    }
}
