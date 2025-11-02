using Microsoft.AspNetCore.Mvc;
using StoreManagement.Data;
using StoreManagement.Models.Entities;

namespace StoreManagement.Controllers
{
    public class AuthController : Controller
    {
        private readonly StoreContext _context;

        public AuthController(StoreContext context)
        {
            _context = context;
        }

        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Login([FromForm] string username, [FromForm] string password)
        {
            // 1. Kiểm tra rỗng
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                return Json(new { success = false, message = "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." });
            }

            // 2. Tìm người dùng
            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
            {
                return Json(new { success = false, message = "Tên đăng nhập không tồn tại." });
            }

            // 3. Kiểm tra mật khẩu
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.Password);
            if (!isPasswordValid)
            {
                return Json(new { success = false, message = "Mật khẩu không chính xác." });
            }

            // 4. Lưu session
            HttpContext.Session.SetString("Username", user.Username);
            HttpContext.Session.SetString("Fullname", user.FullName);
            HttpContext.Session.SetString("Role", user.Role.ToString());

            // 5. Trả về JSON redirect
            string redirectUrl = user.Role switch
            {
                Role.Admin => Url.Action("Index", "Product"),
                Role.Staff => Url.Action("Index", "Orders"),
                _ => Url.Action("Index", "Home")
            };

            return Json(new { success = true, redirect = redirectUrl });
        }


        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }
    }
}
