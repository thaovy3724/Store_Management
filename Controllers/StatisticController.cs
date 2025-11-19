using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models.Entities;
using StoreManagement.Models.ViewModel.Statistic;

namespace StoreManagement.Controllers;

public class StatisticController(ApplicationDbContext _dbContext) : Controller
{
    // GET
    public async Task<IActionResult> Index()
    {
        DateTime today = DateTime.Now;

        // Xác định tuần hiện tại
        var diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
        DateTime startOfWeek = today.AddDays(-diff).Date;
        DateTime endOfWeek = startOfWeek.AddDays(7);

        // Tuần trước
        DateTime startOfLastWeek = startOfWeek.AddDays(-7);
        DateTime endOfLastWeek = startOfWeek;

        // Doanh thu tuần này
        var revenueThisWeek = await _dbContext.Orders
            .Where(o => o.OrderDate >= startOfWeek && o.OrderDate < endOfWeek && o.Status == OrderStatus.Paid)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        // Doanh thu tuần trước
        var revenueLastWeek = await _dbContext.Orders
            .Where(o => o.OrderDate >= startOfLastWeek && o.OrderDate < endOfLastWeek && o.Status == OrderStatus.Paid)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        // Đơn hàng tuần này
        var orderCount = await _dbContext.Orders
            .CountAsync(o => o.OrderDate >= startOfWeek && o.OrderDate < endOfWeek && o.Status == OrderStatus.Paid);

        // Đơn hàng tuần trước
        var orderCountLastWeek = await _dbContext.Orders
            .CountAsync(o =>
                o.OrderDate >= startOfLastWeek && o.OrderDate < endOfLastWeek && o.Status == OrderStatus.Paid);

        // Khách hàng mới tuần này
        var newCustomers = await _dbContext.Customers
            .CountAsync(c => c.CreatedAt >= startOfWeek && c.CreatedAt < endOfWeek);

        // Khách hàng mới tuần trước
        var newCustomersLastWeek = await _dbContext.Customers
            .CountAsync(c => c.CreatedAt >= startOfLastWeek && c.CreatedAt < endOfLastWeek);

        // Sản phẩm bán được tuần này
        var soldProducts = await _dbContext.OrderItems
            .Where(orderItem => orderItem.Order.OrderDate >= startOfWeek && orderItem.Order.OrderDate < endOfWeek &&
                                orderItem.Order.Status == OrderStatus.Paid)
            .SumAsync(oi => (int?)oi.Quantity) ?? 0;

        // Sản phẩm bán được tuần trước
        var soldProductsLastWeek = await _dbContext.OrderItems
            .Where(orderItem => orderItem.Order.OrderDate >= startOfLastWeek &&
                                orderItem.Order.OrderDate < endOfLastWeek && orderItem.Order.Status == OrderStatus.Paid)
            .SumAsync(oi => (int?)oi.Quantity) ?? 0;

        // Hàm tính phần trăm thay đổi (an toàn chia 0)
        decimal CalcPercent(decimal current, decimal previous)
        {
            if (previous == 0) return current > 0 ? 100 : 0;
            return Math.Round(((current - previous) / previous) * 100, 1);
        }

        // Chỉ tiêu trong tuần (có thể chỉnh theo nhu cầu)
        decimal revenueTarget = 10_000_000m;
        int orderTarget = 150;
        int customerTarget = 25;
        int soldTarget = 200;

        // Tính phần trăm đạt chỉ tiêu
        decimal GetProgress(decimal value, decimal target)
        {
            if (target == 0) return 0;
            var progress = (value / target) * 100;
            return progress > 100 ? 100 : Math.Round(progress, 1);
        }

        ViewBag.RevenueProgress = GetProgress(revenueThisWeek, revenueTarget);
        ViewBag.OrderProgress = GetProgress(orderCount, orderTarget);
        ViewBag.CustomerProgress = GetProgress(newCustomers, customerTarget);
        ViewBag.SoldProgress = GetProgress(soldProducts, soldTarget);

        // Tính phần trăm thay đổi
        ViewBag.RevenueChange = CalcPercent(revenueThisWeek, revenueLastWeek);
        ViewBag.OrderChange = CalcPercent(orderCount, orderCountLastWeek);
        ViewBag.CustomerChange = CalcPercent(newCustomers, newCustomersLastWeek);
        ViewBag.SoldChange = CalcPercent(soldProducts, soldProductsLastWeek);

        // Chỉ tiêu
        ViewBag.RevenueTarget = revenueTarget;
        ViewBag.OrderTarget = orderTarget;
        ViewBag.CustomerTarget = customerTarget;
        ViewBag.SoldTarget = soldTarget;

        // Gửi dữ liệu sang View
        ViewBag.Revenue = revenueThisWeek;
        ViewBag.OrderCount = orderCount;
        ViewBag.NewCustomers = newCustomers;
        ViewBag.SoldProducts = soldProducts;

        // Lấy tất cả năm có trong bảng Orders
        var years = await _dbContext.Orders
            .Select(o => o.OrderDate.Year)
            .Distinct()
            .OrderByDescending(y => y)
            .ToListAsync();

        ViewBag.Years = years;
        ViewBag.CurrentYear = DateTime.Now.Year;

        return View();
    }

    // Lọc biểu đồ đường theo năm
    [HttpGet]
    public async Task<IActionResult> GetRevenueByMonth(int year)
    {
        if (year == 0)
            year = DateTime.Now.Year;

        var result = await _dbContext.Orders
            .Where(o => o.OrderDate.Year == year && o.Status == OrderStatus.Paid)
            .GroupBy(o => o.OrderDate.Month)
            .Select(g => new StatisticViewModel.RevenueByMonthVM
            {
                Month = g.Key,
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .OrderBy(r => r.Month)
            .ToListAsync();

        return Json(result);
    }

    // Lọc biểu đồ đường theo khoảng ngày
    [HttpGet]
    public async Task<IActionResult> GetRevenueByRange(DateTime? startDate, DateTime? endDate)
    {
        if (startDate == null || endDate == null)
            return Json(new { error = "Thiếu dữ liệu ngày lọc" });

        var data = await _dbContext.Orders
            .Where(o => o.Status == OrderStatus.Paid
                        && o.OrderDate.Date >= startDate.Value.Date
                        && o.OrderDate.Date <= endDate.Value.Date)
            .GroupBy(o => o.OrderDate.Date)
            .Select(g => new
            {
                Date = g.Key,
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .ToListAsync();

        var fullRange = Enumerable.Range(0, (endDate.Value.Date - startDate.Value.Date).Days + 1)
            .Select(offset => startDate.Value.Date.AddDays(offset))
            .Select(date => new
            {
                Date = date,
                Revenue = data.FirstOrDefault(d => d.Date == date)?.Revenue ?? 0
            })
            .ToList();

        return Json(fullRange);
    }

    // Biểu đồ tròn
    [HttpGet]
    public async Task<IActionResult> GetTopData(int type, int limit, DateTime? startDate, DateTime? endDate)
    {
        if (limit <= 0) limit = 5;

        DateTime start = startDate ?? DateTime.Now.AddMonths(-1);
        DateTime end = endDate ?? DateTime.Now;

        if (type == 1)
        {
            // Top sản phẩm bán chạy nhất
            var topProducts = await _dbContext.OrderItems
                .Where(oi => oi.Order.Status == OrderStatus.Paid &&
                             oi.Order.OrderDate >= start && oi.Order.OrderDate <= end)
                .GroupBy(oi => oi.Product.ProductName)
                .Select(g => new { Label = g.Key, Value = g.Sum(x => x.Quantity) })
                .OrderByDescending(x => x.Value)
                .Take(limit)
                .ToListAsync();

            return Json(topProducts);
        }
        else if (type == 2)
        {
            // Sản phẩm ít bán chạy nhất
            var lowProducts = await _dbContext.OrderItems
                .Where(oi => oi.Order.Status == OrderStatus.Paid &&
                             oi.Order.OrderDate >= start && oi.Order.OrderDate <= end)
                .GroupBy(oi => oi.Product.ProductName)
                .Select(g => new { Label = g.Key, Value = g.Sum(x => x.Quantity) })
                .OrderBy(x => x.Value)
                .Take(limit)
                .ToListAsync();

            return Json(lowProducts);
        }
        else if (type == 3)
        {
            // Khách hàng chi tiêu nhiều nhất
            var topCustomers = await _dbContext.Orders
                .Where(o => o.Status == OrderStatus.Paid &&
                            o.OrderDate >= start && o.OrderDate <= end)
                .GroupBy(o => o.Customer.Name)
                .Select(g => new { Label = g.Key, Value = g.Sum(x => x.TotalAmount) })
                .OrderByDescending(x => x.Value)
                .Take(limit)
                .ToListAsync();

            return Json(topCustomers);
        }
        else if (type == 4)
        {
            // Khách hàng chi tiêu ít nhất
            var lowCustomers = await _dbContext.Orders
                .Where(o => o.Status == OrderStatus.Paid &&
                            o.OrderDate >= start && o.OrderDate <= end)
                .GroupBy(o => o.Customer.Name)
                .Select(g => new { Label = g.Key, Value = g.Sum(x => x.TotalAmount) })
                .OrderBy(x => x.Value)
                .Take(limit)
                .ToListAsync();

            return Json(lowCustomers);
        }

        return Json(new { error = "Loại thống kê không hợp lệ" });
    }
}