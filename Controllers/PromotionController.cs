using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models.Entities;
using StoreManagement.Models.ViewModels;
using System.Drawing;

namespace StoreManagement.Controllers
{
    public class PromotionController : Controller
    {
        private readonly ApplicationDbContext db;
        private readonly IWebHostEnvironment _env;

        public PromotionController(ApplicationDbContext context)
        {
            db = context;
        }

        // --- 1. Index + phân trang + lọc ---
        [HttpGet]
        public async Task<IActionResult> Index(
            int page = 1,
            int pageSize = 5,
            string search = "",
            string status = "",
            DateTime? fromDate = null,
            DateTime? toDate = null)
        {
            var query = db.Promotions.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                string keyword = search.Trim().ToUpper();
                query = query.Where(p => p.PromoCode.ToUpper().Contains(keyword));
            }

            if (!string.IsNullOrEmpty(status) && Enum.TryParse<PromotionStatus>(status, out var statusEnum))
            {
                query = query.Where(p => p.Status == statusEnum);
            }

            if (fromDate.HasValue)
                query = query.Where(p => p.StartDate >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(p => p.EndDate <= toDate.Value);

            var totalItems = await query.CountAsync();

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

            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var viewModel = new PromotionPageViewModel
            {
                Promotions = promotions,
                CurrentPage = page,
                TotalPages = totalPages,
                PageSize = pageSize,
                SearchTerm = search,
                FilterStatus = status,
                FromDate = fromDate,
                ToDate = toDate,
                StatusList = Enum.GetValues(typeof(PromotionStatus)).Cast<PromotionStatus>()
            };

            return View(viewModel);
        }

        // --- 2. Thêm mới ---
        [HttpPost]
        public async Task<IActionResult> Add([FromForm] PromotionViewModel model)
        {
            var existing = await db.Promotions
                .FirstOrDefaultAsync(p => p.PromoCode == model.PromoCode);
            if (existing != null)
                return Json(new { success = false, message = "Mã khuyến mãi đã tồn tại" });

            var promo = new Promotion
            {
                PromoCode = model.PromoCode,
                DiscountType = model.DiscountType,
                DiscountValue = model.DiscountValue,
                MinOrderAmount = model.MinOrderAmount,
                UsageLimit = model.UsageLimit,
                StartDate = model.StartDate,
                EndDate = model.EndDate,
                Status = model.Status,
                Description = model.Description
            };

            db.Promotions.Add(promo);
            await db.SaveChangesAsync();

            return Json(new { success = true, message = "Thêm khuyến mãi thành công" });
        }

        // --- 3. Cập nhật ---
        [HttpPut]
        public async Task<IActionResult> Update([FromForm] PromotionViewModel model, int promoId)
        {
            var promo = await db.Promotions.FindAsync(promoId);
            if (promo == null)
                return Json(new { success = false, message = "Khuyến mãi không tồn tại" });

            promo.PromoCode = model.PromoCode;
            promo.DiscountType = model.DiscountType;
            promo.DiscountValue = model.DiscountValue;
            promo.MinOrderAmount = model.MinOrderAmount;
            promo.UsageLimit = model.UsageLimit;
            promo.StartDate = model.StartDate;
            promo.EndDate = model.EndDate;  
            promo.Status = model.Status;
            promo.Description = model.Description;

            await db.SaveChangesAsync();
            return Json(new { success = true, message = "Cập nhật khuyến mãi thành công" });
        }

        // --- 4. Xóa ---
        [HttpPost]
        public async Task<IActionResult> Delete(int promoId)
        {
            var promo = await db.Promotions.FindAsync(promoId);
            if (promo == null)
                return Json(new { success = false, message = "Khuyến mãi không tồn tại" });

            // Toggle trạng thái
            promo.Status = promo.Status == PromotionStatus.Active
                           ? PromotionStatus.Inactive
                           : PromotionStatus.Active;

            await db.SaveChangesAsync();

            string statusText = promo.Status == PromotionStatus.Active ? "kích hoạt" : "khóa";
            return Json(new { success = true, message = $"Mã khuyến mãi đã được {statusText}", status = promo.Status.ToString() });
        }

        // --- 5. Chi tiết ---
        [HttpGet]
        public async Task<IActionResult> Detail(int promoId)
        {
            var promo = await db.Promotions.FindAsync(promoId);
            if (promo == null)
                return Json(new { success = false, message = "Khuyến mãi không tồn tại" });

            var vm = new PromotionViewModel
            {
                PromoId = promo.PromoId,
                PromoCode = promo.PromoCode,
                DiscountType = promo.DiscountType,
                DiscountValue = promo.DiscountValue,
                MinOrderAmount = promo.MinOrderAmount,
                UsageLimit = promo.UsageLimit,
                StartDate = promo.StartDate,
                EndDate = promo.EndDate,
                Status = promo.Status,
                Description = promo.Description
            };

            return Json(new { success = true, viewModel = vm });
        }
    }
}
