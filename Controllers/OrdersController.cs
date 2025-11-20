using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Models.ViewModel.Utils;
using StoreManagement.Data;
using StoreManagement.Models.Entities;
using StoreManagement.Models.Pages.Orders;
using StoreManagement.Models.Pages.Product;

namespace StoreManagement.Controllers
{
    public class OrdersController : Controller
    {
        private readonly ApplicationDbContext dbContext;

        public OrdersController(ApplicationDbContext context)
        {
            dbContext = context;
        }

        [HttpGet]
        public async Task<IActionResult> Index(
            int page = 1,
            int pageSize = 5,
            string search = "",
            int? status = null,
            decimal? priceFrom = null,
            decimal? priceTo = null)
        {
            // Truy vấn cơ bản với các include
            var query = dbContext.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .AsQueryable();

            // Chuyển search string sang int nếu có thể
            if (!string.IsNullOrEmpty(search) && int.TryParse(search, out int orderId))
            {
                query = query.Where(o => o.OrderId == orderId);
            }

            // Lọc theo Status nếu có
            if (status.HasValue && status.Value >= 0)
                query = query.Where(o => (int)o.Status == status.Value);

            // Lọc theo giá min
            if (priceFrom.HasValue)
                query = query.Where(o => o.TotalAmount >= priceFrom.Value);

            // Lọc theo giá max
            if (priceTo.HasValue)
                query = query.Where(o => o.TotalAmount <= priceTo.Value);

            // Chọn ra ViewModel
            var ordersList = await query
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrdersViewTableModel
                {
                    OrderId = o.OrderId,
                    CustomerName = o.Customer != null ? o.Customer.Name : "N/A",
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status
                })
                .ToListAsync();

            // Phân trang
            var pagedOrders = Pagination<OrdersViewTableModel>.Create(ordersList, page, pageSize);

            // ViewModel tổng hợp
            var viewModel = new OrdersPageViewModel
            {
                Orders = pagedOrders.Items,
                CurrentPage = pagedOrders.CurrentPage,
                TotalPages = pagedOrders.TotalPages,
                Search = search,          // giữ giá trị search để hiển thị lại trên input
                Status = status,
                PriceFrom = priceFrom,
                PriceTo = priceTo
            };

            return View(viewModel);
        }


        [HttpGet]
        public async Task<IActionResult> Detail(int id)
        {
            // Lấy đơn hàng + quan hệ
            var order = await dbContext.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .Include(o => o.Promotion)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return Json(new { success = false, message = "Đơn hàng không tồn tại." });
            }

            // Lấy Payment (nếu có)
            var payment = await dbContext.Payments
                .FirstOrDefaultAsync(p => p.OrderId == id);

            // Map OrderItems sang Items
            var items = order.OrderItems.Select(oi => new OrderItemDetail
            {
                ProductName = oi.Product?.ProductName ?? "-",
                ProductImage = oi.Product?.ProductImage ?? "-",
                Price = oi.Price,
                Quantity = oi.Quantity,
                SubTotal = oi.Subtotal
            }).ToList();

            // Map sang viewModel
            var viewModel = new OrdersViewDetailModel
            {
                CustomerName = order.Customer?.Name ?? "N/A",
                UserName = order.User?.Username ?? "N/A",
                OrderDate = order.OrderDate,
                Status = order.Status,
                PaymentMethod = payment?.PaymentMethod ?? PaymentMethod.Cash,
                TotalAmount = order.TotalAmount,
                DiscountAmount = order.DiscountAmount,
                PromotionCode = order.Promotion?.PromoCode ?? "-",
                Items = items
            };

            return Json(new { success = true, viewModel });
        }
    }
}
