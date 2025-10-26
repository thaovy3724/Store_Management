using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models.Entities;
using System.Threading.Tasks;
using System;

namespace StoreManagement.Controllers
{
    public class CategoryController : Controller
    {
        private readonly StoreManagementContext _context;

        public CategoryController(StoreManagementContext context)
        {
            _context = context;
        }

        // GET: Category - Hiển thị trang chính
        public async Task<IActionResult> Index(int page = 1)
        {
            int pageSize = 7;
            var totalItems = await _context.Categories.CountAsync();
            var categories = await _context.Categories
                .OrderBy(c => c.CategoryId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            ViewBag.CurrentPage = page;
            ViewBag.TotalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            return View(categories);
        }


        private bool IsValidCategoryName(string name)
        {
            // Chỉ cho phép chữ cái và khoảng trắng
            return System.Text.RegularExpressions.Regex.IsMatch(name, @"^[\p{L}\s]+$");
        }

        // POST: Category/Create - Thêm mới category (AJAX)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([FromForm] string categoryName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(categoryName))
                {
                    return Json(new { success = false, message = "Tên loại sản phẩm không được để trống!" });
                }

                // Kiểm tra trùng tên
                var existingCategory = await _context.Categories
                    .FirstOrDefaultAsync(c => c.CategoryName.ToLower() == categoryName.ToLower());

                if (existingCategory != null)
                {
                    return Json(new { success = false, message = "Tên loại sản phẩm đã tồn tại!" });
                }

                if (string.IsNullOrWhiteSpace(categoryName))
                    return Json(new { success = false, message = "Tên loại sản phẩm không được để trống!" });

                if (!IsValidCategoryName(categoryName))
                    return Json(new { success = false, message = "Tên loại sản phẩm chỉ được chứa chữ cái và khoảng trắng!" });

                var category = new Category
                {
                    CategoryName = categoryName.Trim()
                };

                _context.Categories.Add(category);
                await _context.SaveChangesAsync();

                return Json(new
                {
                    success = true,
                    message = "Thêm loại sản phẩm thành công!",
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

        // GET: Category/GetCategory/5 - Lấy thông tin category để edit (AJAX)
        [HttpGet]
        public async Task<IActionResult> GetCategory(int id)
        {
            try
            {
                var category = await _context.Categories.FindAsync(id);
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

        // POST: Category/Edit/5 - Cập nhật category (AJAX)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [FromForm] string categoryName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(categoryName))
                {
                    return Json(new { success = false, message = "Tên loại sản phẩm không được để trống!" });
                }

                var category = await _context.Categories.FindAsync(id);
                if (category == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy loại sản phẩm!" });
                }

                // Kiểm tra trùng tên (trừ chính nó)
                var existingCategory = await _context.Categories
                    .FirstOrDefaultAsync(c => c.CategoryName.ToLower() == categoryName.ToLower() && c.CategoryId != id);

                if (existingCategory != null)
                {
                    return Json(new { success = false, message = "Tên loại sản phẩm đã tồn tại!" });
                }

                if (string.IsNullOrWhiteSpace(categoryName))
                    return Json(new { success = false, message = "Tên loại sản phẩm không được để trống!" });

                if (!IsValidCategoryName(categoryName))
                    return Json(new { success = false, message = "Tên loại sản phẩm chỉ được chứa chữ cái và khoảng trắng!" });


                category.CategoryName = categoryName.Trim();
                _context.Update(category);
                await _context.SaveChangesAsync();

                return Json(new
                {
                    success = true,
                    message = "Cập nhật loại sản phẩm thành công!",
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

        // POST: Category/Delete/5 - Xóa category (AJAX)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var category = await _context.Categories.FindAsync(id);
                if (category == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy loại sản phẩm!" });
                }

                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Xóa loại sản phẩm thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Có lỗi xảy ra khi xóa: " + ex.Message });
            }
        }

        // GET: Category/Search - Tìm kiếm category (AJAX)
        [HttpGet]
        public async Task<IActionResult> Search(string searchTerm)
        {
            try
            {
                var categories = await _context.Categories
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
}
