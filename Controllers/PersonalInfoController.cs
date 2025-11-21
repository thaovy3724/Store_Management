using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models.Entities;

namespace StoreManagement.Controllers;

public class PersonalInfoController(ApplicationDbContext _dbContext) : Controller
{
    // GET
    public async Task<IActionResult> Index()
    {

        // TODO: Set session để test dữ liệu
        // if (string.IsNullOrEmpty(HttpContext.Session.GetString("UserId")))
        // {
        //     HttpContext.Session.SetString("UserId", "1");
        //     HttpContext.Session.SetString("Username", "QtotheH");
        //     HttpContext.Session.SetString("Fullname", "Quỳnh Hương");
        //     HttpContext.Session.SetString("Role", "Admin");
        // }
        
        var userIdClaim = HttpContext.Session.GetString("UserId");
        if (userIdClaim == null) return RedirectToAction("Index", "Auth");

        int userId = int.Parse(userIdClaim);
        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return View(user);
    }
    
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdatePersonalInfo(int userId, string fullName, string username)
    {
        try
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return Json(new { success = false, message = "Không tìm thấy người dùng!" });

            // Kiểm tra trùng username
            var exists = await _dbContext.Users.AnyAsync(u => u.Username == username && u.UserId != userId);
            if (exists)
            {
                return Json(new { success = false, message = "Tên đăng nhập đã tồn tại!" });
            }

            user.FullName = fullName.Trim();
            user.Username = username.Trim();
            _dbContext.Update(user);
            await _dbContext.SaveChangesAsync();

            return Json(new { success = true, message = "Cập nhật thông tin thành công!" });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
        }
    }

    // POST: PersonalInfo/ChangePassword
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ChangePassword(int userId, string newPassword)
    {
        try
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return Json(new { success = false, message = "Không tìm thấy người dùng!" });
            
            // Gán password mới vào đối tượng user
            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            
            _dbContext.Update(user);
            await _dbContext.SaveChangesAsync();

            return Json(new { success = true, message = "Đổi mật khẩu thành công!" });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
        }
    }
}