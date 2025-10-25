using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.SqlServer.Query.Internal;
using store_management.Data;
using store_management.Models;
using store_management.Models.Entities;

namespace store_management.Controllers
{
    public class AccountController: Controller
    {
        private readonly AppDbContext dbContext;
        public AccountController(AppDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> Register()
        {
            return View(new RegisterViewModel());
        }
        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            var existingUser = await dbContext.Accounts.FirstOrDefaultAsync(
                a => a.username == model.username || a.email == model.email);
            if (existingUser != null)
            {
                if (existingUser.username == model.username)
                    ModelState.AddModelError("username", "Tên đăng nhập này đã có người sử dụng.");
                if (existingUser.email == model.email)
                    ModelState.AddModelError("email", "Email này đã được đăng ký.");
                return View(model);
            }

            var acc = new Account
            {
                username = model.username,
                email = model.email,
                password = model.password, 
                role = "User"
            };
            await dbContext.Accounts.AddAsync(acc);
            await dbContext.SaveChangesAsync();
            return RedirectToAction("Login", "Account");
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            return View(new CreateViewModel());
        }
        [HttpPost]
        public async  Task<IActionResult> Create(CreateViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            var existingUser = await dbContext.Accounts.FirstOrDefaultAsync(
                a => a.username == model.username || a.email == model.email);
            if (existingUser != null)
            {
                if (existingUser.username == model.username)
                    ModelState.AddModelError("username", "Tên đăng nhập này đã tồn tại.");
                if (existingUser.email == model.email)
                    ModelState.AddModelError("email", "Email này đã được đăng ký.");
                return View(model);
            }
            var acc = new Account
            {
                username = model.username,
                email = model.email,
                password = model.password, 
                role = model.role, 
            };
            await dbContext.Accounts.AddAsync(acc);
            await dbContext.SaveChangesAsync();
            return RedirectToAction("All", "Account");
        }

        [HttpGet]
        public async Task<IActionResult> All()
        {
            var list = await dbContext.Accounts.ToListAsync();

            return View(list);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var acc = await dbContext.Accounts.FindAsync(id);
            return View(acc);
        }
        [HttpPost]
        public async Task<IActionResult> Edit(Account account)
        {
            var acc = await dbContext.Accounts.FindAsync(account.accountId);
            if(acc is not null)
            {
                acc.username = account.username;
                acc.email = account.email;
                acc.password = account.password;
                acc.role = account.role;
                await dbContext.SaveChangesAsync();
            }
            return RedirectToAction("All", "Account");
        }

        [HttpPost]
        public async Task<IActionResult> Delete(Account account)
        {
            var acc = await dbContext.Accounts.AsNoTracking().FirstOrDefaultAsync(x => x.accountId == account.accountId);
            if(acc is not null)
            {
                dbContext.Accounts.Remove(acc);
                await dbContext.SaveChangesAsync();
            }
            return RedirectToAction("All", "Account");
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }
        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await dbContext.Accounts.FirstOrDefaultAsync(a => a.username == model.username && a.password == model.password);
                if(user != null)
                {
                    HttpContext.Session.SetString("username", user.username);
                    HttpContext.Session.SetString("role", user.role ?? "user");

                    if (user.role == "Admin")
                        return RedirectToAction("All", "Account");
                    else
                        return RedirectToAction("Index", "Home");
                }
                ViewBag.Error = "Tên đăng nhập hoặc mật khẩu không chính xác";
            }
            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login", "Account");
        }
        
    }
}
