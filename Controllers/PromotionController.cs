using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models.Entities;
using StoreManagement.Models.ViewModels;
using System;
using System.Linq;
//using System.Web.Mvc;

namespace StoreManagement.Controllers
{
    public class PromotionController : Controller
    {
        private readonly ApplicationDbContext db;
        public PromotionController(ApplicationDbContext context)
        {
            db = context;
        }
        [HttpGet]
        public async Task<IActionResult> Index(
                    int page = 1,
                    int pageSize = 5,
                    string? search = null,
                    PromotionStatus? status = null,
                    DateTime? fromDate = null,
                    DateTime? toDate = null)
        {
            var query = db.Promotions.AsQueryable();

            // Filter search
            if (!string.IsNullOrWhiteSpace(search))
            {
                string keyword = search.Trim().ToUpper();
                query = query.Where(p => p.PromoCode.ToUpper().Contains(keyword));
            }

            // Filter status
            if (status.HasValue)
                query = query.Where(p => p.Status == status.Value);

            // Filter date
            if (fromDate.HasValue)
                query = query.Where(p => p.StartDate >= fromDate.Value);
            if (toDate.HasValue)
                query = query.Where(p => p.EndDate <= toDate.Value);

            // Tổng số bản ghi
            var totalItems = await query.CountAsync();

            // Lấy dữ liệu phân trang
            var promotions = await query
                .OrderByDescending(p => p.PromoId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PromotionViewModel
                {
                    PromoId = p.PromoId,
                    PromoCode = p.PromoCode,
                    DiscountType = p.DiscountType,
                    DiscountValue = p.DiscountValue,
                    MinOrderAmount = p.MinOrderAmount,
                    UsageLimit = p.UsageLimit,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Status = p.Status,
                    Description = p.Description
                })
                .ToListAsync();

            // Tính tổng trang
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            // Build view model
            var viewModel = new PromotionPageViewModel
            {
                Promotions = promotions,
                CurrentPage = page,
                TotalPages = totalPages,
                SearchTerm = search
            };

            return View(viewModel);
        }


    }
}
