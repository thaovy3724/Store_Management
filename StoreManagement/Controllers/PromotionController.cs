using Microsoft.AspNetCore.Mvc;
using StoreManagement.Data;
using StoreManagement.Models.Entities;
using System;
using System.Linq;
//using System.Web.Mvc;

namespace StoreManagement.Controllers
{
    public class PromotionController : Controller
    {
        private readonly StoreContext db;
        public PromotionController(StoreContext context)
        {
            db = context;
        }
        public IActionResult Index()
        {
            return View("Promotion");
        }


        // GET: Promotion/GetAll
        [HttpGet]
        public JsonResult GetAll()
        {
            var list = db.Promotions
                .OrderByDescending(p => p.Id)
                .Select(p => new {
                    id = p.Id,
                    code = p.Code,
                    type = p.Type,
                    value = p.Value,
                    minOrderAmount = p.MinOrderAmount,
                    usageLimit = p.UsageLimit,
                    startDate = p.StartDate,
                    endDate = p.EndDate
                })
                .ToList();

            return Json(list);
        }

        // GET: Promotion/Get/5
        [HttpGet]
        public JsonResult Get(int id)
        {
            var p = db.Promotions.Find(id);
            if (p == null)
                return Json(new { success = false, message = "Không tìm thấy mã giảm giá." });

            return Json(new { success = true, data = p });
        }

        // POST: Promotion/Create
        [HttpPost]
        public JsonResult Create(Promotion model)
        {
            try
            {
                model.Code = model.Code?.Trim().ToUpper();
                db.Promotions.Add(model);
                db.SaveChanges();
                return Json(new { success = true, message = "Đã thêm mã khuyến mãi mới." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // POST: Promotion/Update/5
        [HttpPost]
        public JsonResult Update(int id, Promotion model)
        {
            try
            {
                var promo = db.Promotions.Find(id);
                if (promo == null)
                    return Json(new { success = false, message = "Không tìm thấy mã." });

                promo.Type = model.Type;
                promo.Value = model.Value;
                promo.MinOrderAmount = model.MinOrderAmount;
                promo.UsageLimit = model.UsageLimit;
                promo.StartDate = model.StartDate;
                promo.EndDate = model.EndDate;

                db.SaveChanges();
                return Json(new { success = true, message = "Đã cập nhật mã khuyến mãi." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // POST: Promotion/Delete/5
        [HttpPost]
        public JsonResult Delete(int id)
        {
            try
            {
                var promo = db.Promotions.Find(id);
                if (promo == null)
                    return Json(new { success = false, message = "Không tìm thấy mã." });

                db.Promotions.Remove(promo);
                db.SaveChanges();
                return Json(new { success = true, message = "Đã xóa mã khuyến mãi." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}
