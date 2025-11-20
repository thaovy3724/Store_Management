//using Microsoft.AspNetCore.Mvc;
//using StoreManagement.Data;
//using StoreManagement.Models.Entities;
//using System;
//using System.Linq;
////using System.Web.Mvc;

//namespace StoreManagement.Controllers
//{
//    public class PromotionController : Controller
//    {
//        private readonly ApplicationDbContext db;
//        public PromotionController(ApplicationDbContext context)
//        {
//            db = context;
//        }
//        public IActionResult Index()
//        {
//            return View("Promotion");
//        }


//        // GET: Promotion/GetAll?search=SUMMER&status=Active&fromDate=2025-01-01&toDate=2025-12-31&page=1&pageSize=10
//        [HttpGet]
//        public JsonResult GetAll(string search = null, string status = null, DateTime? fromDate = null, DateTime? toDate = null, int page = 1, int pageSize = 10)
//        {
//            // .AsQueryable() đổi DbSet<Promotion> thành IQueryable<Promotion>, giúp xây dựng các truy vấn LinQ
//            // Các truy vấn này là deferred execution (Các truy vấn không thực hiện ngay) như Select, Where, ...
//            var query = db.Promotions.AsQueryable();

//            // Tìm kiếm theo từ khóa
//            if (!string.IsNullOrEmpty(search))
//            {
//                search = search.ToUpper();
//                query = query.Where(p => p.PromoCode.ToUpper().Contains(search));
//            }

//            // Lọc theo trạng thái
//            if (!string.IsNullOrEmpty(status))
//            {
//                query = query.Where(p => p.Status == status);
//            }

//            // Lọc theo thời gian
//            if (fromDate.HasValue)
//            {
//                query = query.Where(p => p.EndDate >= fromDate.Value);
//            }
//            if (toDate.HasValue)
//            {
//                query = query.Where(p => p.StartDate <= toDate.Value);
//            }

//            // Tổng số bản ghi (sau khi lọc)
//            int totalCount = query.Count();

//            // Phân trang
//            var list = query
//                .OrderByDescending(p => p.Id)
//                .Skip((page - 1) * pageSize) // Vd đang ở trang 2 (page = 2) => bỏ qua 1 * pageSize (=10) = 10 mã
//                .Take(pageSize) // => Lấy ra pageSize (=10) phần tử sau khi đã Skip
//                .Select(p => new {
//                    id = p.Id,
//                    code = p.Code,
//                    type = p.Type,
//                    value = p.Value,
//                    minOrderAmount = p.MinOrderAmount,
//                    usageLimit = p.UsageLimit,
//                    startDate = p.StartDate,
//                    endDate = p.EndDate,
//                    status = p.Status
//                })
//                .ToList();

//            return Json(new { totalCount, items = list });
//        }

//        // GET: Promotion/Get/5
//        [HttpGet]
//        public JsonResult Get(int id)
//        {
//            var p = db.Promotions.Find(id);
//            if (p == null)
//                return Json(new { success = false, message = "Không tìm thấy mã giảm giá." });

//            return Json(new { success = true, data = p });
//        }

//        // POST: Promotion/Create
//        [HttpPost]
//        public JsonResult Create(Promotion model)
//        {
//            try
//            {
//                model.Code = model.Code?.Trim().ToUpper();
//                // Cái này để tạm thui tại sql server express hong có xài agent job được  =)))))))
//                DateTime today = DateTime.Today;
//                model.Status = "Active";
//                if (today < model.StartDate)
//                {
//                    model.Status = "Upcoming";
//                } else if (today > model.EndDate)
//                {
//                    model.Status = "Ended";
//                }

//                    db.Promotions.Add(model);
//                db.SaveChanges();
//                return Json(new { success = true, message = "Đã thêm mã khuyến mãi mới." });
//            }
//            catch (Exception ex)
//            {
//                return Json(new { success = false, message = ex.Message });
//            }
//        }

//        // POST: Promotion/Update/5
//        [HttpPost]
//        public JsonResult Update(int id, Promotion model)
//        {
//            try
//            {
//                var promo = db.Promotions.Find(id);
//                if (promo == null)
//                    return Json(new { success = false, message = "Không tìm thấy mã." });
//                promo.Code = model.Code;
//                promo.Type = model.Type;
//                promo.Value = model.Value;
//                promo.MinOrderAmount = model.MinOrderAmount;
//                promo.UsageLimit = model.UsageLimit;
//                promo.StartDate = model.StartDate;
//                promo.EndDate = model.EndDate;

//                db.SaveChanges();
//                return Json(new { success = true, message = "Đã cập nhật mã khuyến mãi." });
//            }
//            catch (Exception ex)
//            {
//                return Json(new { success = false, message = ex.Message });
//            }
//        }

//        // POST: Promotion/Delete/5
//        [HttpPost]
//        public JsonResult Delete(int id)
//        {
//            try
//            {
//                var promo = db.Promotions.Find(id);
//                if (promo == null)
//                    return Json(new { success = false, message = "Không tìm thấy mã." });

//                db.Promotions.Remove(promo);
//                db.SaveChanges();
//                return Json(new { success = true, message = "Đã xóa mã khuyến mãi." });
//            }
//            catch (Exception ex)
//            {
//                return Json(new { success = false, message = ex.Message });
//            }
//        }
//    }
//}
