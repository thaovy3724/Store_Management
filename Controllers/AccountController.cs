using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models.Entities;
using StoreManagement.Models.ViewModel.User;
using StoreManagement.Models.ViewModel.Utils;

namespace StoreManagement.Controllers;

public class AccountController(ApplicationDbContext _dbContext) : Controller
{
    // GET
    [HttpGet]
    public async Task<IActionResult> Index(
    int page = 1,
    int pageSize = 5,
    string search = "",
    Role? role = null)
    {
        // Query cơ bản
        var query = _dbContext.Users.AsQueryable();

        // Search theo username hoặc full name
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(u =>
                u.Username.Contains(search) ||
                (u.FullName != null && u.FullName.Contains(search))
            );
        }

        // Lọc theo Role
        if (role.HasValue)
        {
            query = query.Where(u => u.Role == role.Value);
        }

        // Select ra ViewModel (nếu bạn muốn dùng ViewModel)
        var userList = await query
            .OrderBy(u => u.UserId)
            .Select(u => new UserViewTableModel
            {
                UserId = u.UserId,
                Username = u.Username,
                FullName = u.FullName,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        // Phân trang
        var pagedUsers = Pagination<UserViewTableModel>.Create(userList, page, pageSize);

        // Gộp vào PageViewModel
        var viewModel = new UserPageViewModel
        {
            Users = pagedUsers.Items,
            CurrentPage = pagedUsers.CurrentPage,
            TotalPages = pagedUsers.TotalPages,
            Search = search,
            Role = role
        };

        return View(viewModel);
    }


    [HttpGet]
    public async Task<IActionResult> GetAccounts()
    {
        var accounts = await _dbContext.Users
            .OrderBy(a => a.UserId)
            // Trả về những thông tin cần thiết
            .Select(a => new
            {
                UserId = a.UserId,
                Fullname = a.FullName,
                Username = a.Username,
                Role = a.Role.ToString()
            })
            .ToListAsync();
        
        return Json(new { success = true, data = accounts });
    }
    
    // POST: Account/Create - Thêm mới account
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(User model)
    {
        try
        {
            // Kiểm tra trùng tên
            var existingAccount = await _dbContext.Users
                .FirstOrDefaultAsync(a => a.Username.ToLower() == model.Username.ToLower());

            if (existingAccount != null)
            {
                return Json(new { success = false, message = "Tài khoản đã tồn tại!" });
            }
            
            model.Password = BCrypt.Net.BCrypt.HashPassword(model.Password);

            _dbContext.Users.Add(model);
            await _dbContext.SaveChangesAsync();
        
            return Json(new { success = true, message = "Thêm tài khoản thành công" });
            
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
        }
    }
    
    // GET -  Customer/GetCustomer
    [HttpGet]
    public async Task<IActionResult> GetAccount(int id)
    {
        var user = await _dbContext.Users
            .Where(a => a.UserId == id)
            // Trả về những thông tin cần thiết
            .Select(a => new
            {
                UserId = a.UserId,
                Fullname = a.FullName,
                Username = a.Username,
                Role = a.Role.ToString().ToLower()
            })
            .FirstOrDefaultAsync();
        if (user == null)
        {
            return Json(new { success = false, message = "Không tìm thấy tài khoản!" });
        }

        return Json(new { success = true, data = user });
    }
    
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, User model)
    {
        // Kiểm tra khách hàng đã tồn tại chưa
        var account = await _dbContext.Users.FindAsync(id);

        if (account == null)
        {
            return Json(new { success = false, message = "Không tìm thấy khách hàng!" });
        }
        
        // Kiểm tra trùng thông tin (bằng sđt)
        var existingAccount = await _dbContext.Users.FirstOrDefaultAsync(a => 
                a.Username == model.Username  &&
                a.UserId != id // Account đang kiểm tra phải != account đang cập nhật
        );

        if (existingAccount != null)
        {
            return Json(new { success = false, message = "Thông tin tài khoản bị trùng!" });
        }
        
        // Cập nhật thông tin
        account.FullName = model.FullName;
        account.Username = model.Username;
        account.Role = model.Role;
        if (!string.IsNullOrEmpty(model.Password)) 
        {
            account.Password = BCrypt.Net.BCrypt.HashPassword(model.Password);
        }
        
        await _dbContext.SaveChangesAsync();

        return Json(new { success = true, message = $"Cập nhật tài khoản có id {id} thành công" });
    }
    
    // POST - Customer/Delete/{id}
    [HttpPost]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var account = await _dbContext.Users.FindAsync(id);
            if (account == null)
            {
                return Json(new { success = true, message = $"Lỗi tìm thấy tài khoản có id {id}" });
            }

            _dbContext.Users.Remove(account);
            await _dbContext.SaveChangesAsync();

            return Json(new { success = true, message = $"Xóa tài khoản có id {id} thành công!" });
        }
        catch (Exception e)
        {
            return Json(new { success = false, message = $"Xóa tài khoản có id {id} thất bại. Lỗi: {e.Message}" });
        }
    }
    
    [HttpGet]
    public async Task<IActionResult> SearchAndFilter(string? keyword, string? role)
    {
        // 1. Khởi tạo query từ bảng Users
        var query = _dbContext.Users.AsQueryable();

        // 2. Lọc theo từ khóa (nếu có)
        if (!string.IsNullOrEmpty(keyword))
        {
            // Chuyển về chữ thường để tìm kiếm tương đối
            keyword = keyword.ToLower(); 
            query = query.Where(a => a.FullName.ToLower().Contains(keyword) || 
                                     a.Username.ToLower().Contains(keyword));
        }

        // 3. Lọc theo quyền (nếu có)
        if (!string.IsNullOrEmpty(role))
        {
            query = query.Where(a => a.Role.ToString().ToLower().Equals(role));
        }

        // 4. Sắp xếp và Select dữ liệu trả về
        var accounts = await query
            .OrderBy(a => a.UserId)
            .Select(a => new
            {
                UserId = a.UserId,
                Fullname = a.FullName,
                Username = a.Username,
                Role = a.Role.ToString()
            })
            .ToListAsync();
    
        return Json(new { success = true, data = accounts });
    }
}