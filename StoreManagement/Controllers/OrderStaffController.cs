using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models.Entities;
using StoreManagement.Models.ViewModel.OrderStaff;

namespace StoreManagement.Controllers
{
    public class OrderStaffController : Controller
    {
        private readonly StoreContext _context;

        public OrderStaffController(StoreContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            var model = new OrderStaffLoadViewPageModel
            {
                Categories = _context.Categories.ToList(),
                Products = _context.Products
                   .Include(p => p.Category)
                   .Include(p => p.Inventory)
                   .Select(p => new OrderStaffLoadProductModel
                   {
                       ProductId = p.ProductId,
                       ProductName = p.ProductName,
                       ProductImage = p.ProductImage,
                       Price = p.Price,
                       Quantity = p.Inventory != null ? p.Inventory.Quantity : 0,
                       CategoryName = p.Category != null ? p.Category.CategoryName : ""
                   })
                   .ToList(),
            };

            return View(model);
        }

        // POST: Thêm khách hàng mới
        [HttpPost]
        public async Task<IActionResult> AddCustomer(AddCustomerInputModel input)
        {
            if (!ModelState.IsValid)
                return BadRequest("Dữ liệu không hợp lệ");

            var existingCustomer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Phone == input.Phone);

            if (existingCustomer != null)
            {
                return Json(new
                {
                    success = false,
                    message = "Số điện thoại này đã tồn tại trong hệ thống!"
                });
            }

            var customer = new Customer
            {
                Name = input.Name,
                Phone = input.Phone,
                Email = string.IsNullOrWhiteSpace(input.Email) ? null : input.Email,
                Address = string.IsNullOrWhiteSpace(input.Address) ? null : input.Address,
                CreatedAt = DateTime.Now
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return Json(new
            {
                success = true,
                customerId = customer.CustomerId,
                customerName = customer.Name
            });
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
                            && p.usageLimit > p.usedCount)
                .Select(p => new OrderStaffLoadPromotionModel
                {
                    PromotionId = p.PromotionId,
                    PromotionCode = p.PromotionCode,
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
                            && p.usageLimit > p.usedCount)
                .Select(p => new OrderStaffLoadPromotionModel
                {
                    PromotionId = p.PromotionId,
                    PromotionCode = p.PromotionCode,
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
                promo = await _context.Promotions.FirstOrDefaultAsync(p => p.PromotionId == input.PromoId);
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
                    DiscountAmount = input.DiscountAmount
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
                        SubTotal = item.Price * item.Quantity
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
                    promo.usedCount += 1;
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

    }
}
