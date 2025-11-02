using Microsoft.AspNetCore.Mvc;
using StoreManagement.Data;

namespace StoreManagement.Controllers;

public class PersonalInfoController(ApplicationDbContext _dbContext) : Controller
{
    // GET
    public async Task<IActionResult> Index()
    {
        // TODO: Tạm thời set session (để test)
        if (string.IsNullOrEmpty(HttpContext.Session.GetString("UserId")))
        {
            HttpContext.Session.SetString("UserId", "1"); // User admin
        }

        var userIdClaim = HttpContext.Session.GetString("UserId");
        if (userIdClaim == null) return RedirectToAction("Login", "Account");

        int userId = int.Parse(userIdClaim);
        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return View(user);
    }
}