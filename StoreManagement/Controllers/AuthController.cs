using Microsoft.AspNetCore.Mvc;
using StoreManagement.Data;

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
        public IActionResult Login(string username, string password)
        {
            ModelState.Remove("username");
            ModelState.Remove("password");
            // --- 1. Kiểm tra rỗng ---
            if (string.IsNullOrWhiteSpace(username))
                ModelState.AddModelError("Username", "Tên đăng nhập không được để trống");

            if (string.IsNullOrWhiteSpace(password))
                ModelState.AddModelError("Password", "Mật khẩu không được để trống");

            // Nếu có lỗi nhập liệu thì dừng ở đây
            if (!ModelState.IsValid)
                return View();

            // --- 2. Kiểm tra tài khoản ---
            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
            {
                ModelState.AddModelError("username", "Tên đăng nhập không tồn tại");
                return View();
            }

            // --- 3. Kiểm tra mật khẩu ---
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.Password);
            if (!isPasswordValid)
            {
                ModelState.AddModelError("password", "Mật khẩu không chính xác");
                return View();
            }

            // --- 4. Thành công -> lưu session ---
            HttpContext.Session.SetString("Username", user.Username);
            HttpContext.Session.SetString("Fullname", user.FullName);
            HttpContext.Session.SetString("Role", user.Role);

            // --- 5. Chuyển hướng theo quyền ---
            if (user.Role == "admin")
                return RedirectToAction("Index", "Product");
            else
                return RedirectToAction("Index", "Product");
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }
    }
}
