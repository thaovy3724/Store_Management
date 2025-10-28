using Microsoft.AspNetCore.Mvc;
using Store_Management.Controllers; // đổi lại theo namespace project của bạn
using StoreManagement.Data;
using System;
using System.Linq;
//using System.Web.Mvc;

namespace Store_Management.Controllers
{
    public class PromotionController : Controller
    {
        private readonly StoreContext dbContext;

        // GET: Promotion/GetAll
        [HttpGet]
        public JsonResult GetAll()
        {
            var list = db.Promotions
                .OrderByDescending(p => p.Id)
                .Select(p => new {
                    p.Id,
                    p.Code,
                    p.Type,
                    p.Value,
                    p.MinOrderAmount,
                    p.UsageLimit,
                    p.StartDate,
                    p.EndDate
                })
                .ToList();

            return Json(list, JsonRequestBehavior.AllowGet);
        }

        // GET: Promotion/Get/5
        [HttpGet]
        public JsonResult Get(int id)
        {
            var p = db.Promotions.Find(id);
            if (p == null)
                return Json(new { success = false, message = "Không tìm thấy mã giảm giá." }, JsonRequestBehavior.AllowGet);

            return Json(new { success = true, data = p }, JsonRequestBehavior.AllowGet);
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
