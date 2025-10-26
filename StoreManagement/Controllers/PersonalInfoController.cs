using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models;
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
            if (string.IsNullOrWhiteSpace(fullName))
                return Json(new { success = false, message = "Họ tên không được để trống!" });

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Json(new { success = false, message = "Không tìm thấy người dùng!" });

            user.FullName = fullName.Trim();
            _context.Update(user);
            await _context.SaveChangesAsync();
            return Json(new { success = true, message = "Cập nhật họ tên thành công!" });
        }

        // POST: PersonalInfo/ChangePassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword(int userId, string newPassword, string confirmPassword)
        {
            if (string.IsNullOrWhiteSpace(newPassword) || string.IsNullOrWhiteSpace(confirmPassword))
                return Json(new { success = false, message = "Mật khẩu không được để trống!" });

            if (newPassword != confirmPassword)
                return Json(new { success = false, message = "Mật khẩu xác nhận không khớp!" });

            if (newPassword.Length < 6)
                return Json(new { success = false, message = "Mật khẩu phải từ 6 ký tự trở lên!" });

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Json(new { success = false, message = "Không tìm thấy người dùng!" });

            user.Password = newPassword; // Trong thực tế nên hash mật khẩu
            _context.Update(user);
            await _context.SaveChangesAsync();
            return Json(new { success = true, message = "Đổi mật khẩu thành công!" });
        }
    }
}

