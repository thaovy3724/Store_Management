using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using System.Threading.Tasks;

namespace StoreManagement.Controllers
{
    public class PersonalInfoController : Controller
    {
        private readonly StoreManagementContext _context;

        public PersonalInfoController(StoreManagementContext context)
        {
            _context = context;
        }

        // GET: PersonalInfo
        public async Task<IActionResult> Index()
        {
            // Tạm thời set session (để test)
            if (string.IsNullOrEmpty(HttpContext.Session.GetString("UserId")))
            {
                HttpContext.Session.SetString("UserId", "1"); // User admin
            }

            var userIdClaim = HttpContext.Session.GetString("UserId");
            if (userIdClaim == null) return RedirectToAction("Login", "Account");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return View(user);
        }

        // POST: PersonalInfo/UpdateFullName
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateFullName(int userId, string fullName)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return Json(new { success = false, message = "Không tìm thấy người dùng!" });

                fullName = fullName?.Trim();

                user.FullName = fullName;
                _context.Update(user);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Cập nhật họ tên thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
            }
        }

        // POST: PersonalInfo/ChangePassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword(int userId, string newPassword, string confirmPassword)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return Json(new { success = false, message = "Không tìm thấy người dùng!" });

                // Validation 
                if (newPassword != confirmPassword)
                    return Json(new { success = false, message = "Mật khẩu xác nhận không khớp!" });
                user.Password = newPassword;
                _context.Update(user);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Đổi mật khẩu thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
            }
        }
    }
}

