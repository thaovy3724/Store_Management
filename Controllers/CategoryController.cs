using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models.Entities;
using StoreManagement.Models.ViewModel.Category;
using StoreManagement.Models.ViewModel.Utils;

namespace StoreManagement.Controllers;

public class CategoryController(ApplicationDbContext _dbContext) : Controller
{
    // GET: Category - Hiển thị trang chính
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1, int pageSize = 5, string search = "")
    {
        var query = _dbContext.Categories.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => c.CategoryName.Contains(search));
        }

        var list = await query
            .OrderBy(c => c.CategoryId)
            .Select(c => new CategoryViewTableModel
            {
                CategoryId = c.CategoryId,
                CategoryName = c.CategoryName
            })
            .ToListAsync();

        var paged = Pagination<CategoryViewTableModel>.Create(list, page, pageSize);

        var vm = new CategoryPageViewModel
        {
            Categories = paged.Items,
            CurrentPage = paged.CurrentPage,
            TotalPages = paged.TotalPages,
            Search = search
        };

        return View(vm);
    }

    // GET: Categories
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _dbContext.Categories
            .OrderBy(c => c.CategoryId)
            .ToListAsync();
        return Json(new { success = true, data = categories });
    }
    
    // POST: Category/Create - Thêm mới category
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([FromForm] string categoryName)
    {
        try
        {
            // Kiểm tra trùng tên
            var existingCategory = await _dbContext.Categories
                .FirstOrDefaultAsync(c => c.CategoryName.ToLower() == categoryName.ToLower());

            if (existingCategory != null)
            {
                return Json(new { success = false, message = "Tên loại sản phẩm đã tồn tại!" });
            }

            var category = new Category
            {
                CategoryName = categoryName.Trim()
            };

            _dbContext.Categories.Add(category);
            await _dbContext.SaveChangesAsync();

            return Json(new
            {
                success = true,
                message = "Thêm loại sản phẩm thành công!",
            });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
        }
    }
    
    // GET: Category
    [HttpGet]
    public async Task<IActionResult> GetCategory(int id)
    {
        try
        {
            var category = await _dbContext.Categories.FindAsync(id);
            if (category == null)
            {
                return Json(new { success = false, message = "Không tìm thấy loại sản phẩm!" });
            }

            return Json(new
            {
                success = true,
                data = new
                {
                    id = category.CategoryId,
                    name = category.CategoryName
                }
            });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
        }
    }
    
    // POST: Category/Edit - Cập nhật category
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, [FromForm] string categoryName)
    {
        try
        {
            var category = await _dbContext.Categories.FindAsync(id);
            if (category == null)
            {
                return Json(new { success = false, message = "Không tìm thấy loại sản phẩm!" });
            }

            categoryName = categoryName.Trim();

            //Kiểm tra trùng tên
            var existingCategory = await _dbContext.Categories
                .FirstOrDefaultAsync(c => c.CategoryName.ToLower() == categoryName.ToLower() && c.CategoryId != id);

            if (existingCategory != null)
            {
                return Json(new { success = false, message = "Tên loại sản phẩm đã tồn tại!" });
            }

            category.CategoryName = categoryName;
            _dbContext.Update(category);
            await _dbContext.SaveChangesAsync();

            return Json(new
            {
                success = true,
                message = "Cập nhật loại sản phẩm thành công!",
            });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
        }
    }
    
    // POST: Category/Delete - Xóa category
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var category = await _dbContext.Categories.FindAsync(id);
            if (category == null)
            {
                return Json(new { success = false, message = "Không tìm thấy loại sản phẩm!" });
            }

            _dbContext.Categories.Remove(category);
            await _dbContext.SaveChangesAsync();

            return Json(new { success = true, message = "Xóa loại sản phẩm thành công!" });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Có lỗi xảy ra khi xóa: " + ex.Message });
        }
    }
    
    // GET: Category/Search - Tìm kiếm category
    [HttpGet]
    public async Task<IActionResult> Search(string searchTerm)
    {
        try
        {
            var categories = await _dbContext.Categories
                .Where(c => string.IsNullOrEmpty(searchTerm) || c.CategoryName.Contains(searchTerm))
                .OrderBy(c => c.CategoryId)
                .ToListAsync();

            return Json(new { success = true, data = categories });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
        }
    }
}