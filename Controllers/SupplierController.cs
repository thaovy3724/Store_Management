using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models.Entities;

namespace StoreManagement.Controllers;

public class SupplierController(ApplicationDbContext _dbContext) : Controller
{
    
    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    // GET Suppliers
    [HttpGet]
    public async Task<IActionResult> GetSuppliers(string search = "")
    {
        var query = _dbContext.Suppliers.AsQueryable();
        
        // Tìm kiếm
        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(s => 
                s.Name.ToLower().Contains(search) ||
                s.Email.ToLower().Contains(search) ||
                s.Phone.Contains(search)
            );
        }
        
        var suppliers = await query
            .OrderBy(s => s.SupplierId)
            .ToListAsync();

        return Json(new { success = true, data = suppliers });
    }

    // INSERT + UPDATE Supplier
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SaveSupplier([FromBody] Supplier model)
    {
        try
        {
            // Kiểm tra email đã tồn tại hay chưa (trừ id hiện tại)
            var existingEmail = await _dbContext.Suppliers.AnyAsync(
                s => s.Email == model.Email && s.SupplierId != model.SupplierId    
            );

            if (existingEmail)
            {
                return Json(new
                {
                    success = false,
                    message = "Email đã tồn tại"
                });
            }
            
            // Kiểm tra số điện thoại đã tồn tại hay chưa
            var existingPhoneNumber =
                await _dbContext.Suppliers.AnyAsync(
                    s => s.Phone == model.Phone && s.SupplierId != model.SupplierId
                );

            if (existingPhoneNumber)
            {
                return Json(new
                {
                    success = false,
                    message = "Số điện thoại đã tồn tại."

                });
            }

            if (model.SupplierId == 0) // Thêm mới
            {
                _dbContext.Suppliers.Add(model);
                await _dbContext.SaveChangesAsync();
                
                return Json(new { success = true, message = "Thêm nhà cung cấp thành công" });
            }
            else // Cập nhật
            {
                var supplier = await _dbContext.Suppliers.FindAsync(model.SupplierId);
                if (supplier == null)
                {
                    return Json(new { success = false, message = "Nhà cung cấp không tồn tại!" });
                }

                supplier.Name = model.Name;
                supplier.Phone = model.Phone;
                supplier.Email = model.Email;
                supplier.Address = model.Address;

                await _dbContext.SaveChangesAsync();
                
                return Json(new { success = true, message = "Cập nhật thông tin nhà cung cấp thành công" });
            }
            
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Lỗi: " + ex.Message });
        }
    }

    // Get Supplier
    [HttpGet]
    public async Task<IActionResult> GetSupplierDetail(int id)
    {
        try
        {
            var supplier = await _dbContext.Suppliers.FindAsync(id);

            if (supplier == null)
            {
                return Json(new { success = false, message = "Không tìm thấy nhà cung cấp" });
            }

            return Json(new { success = true, data = supplier });
        }
        catch (Exception e)
        {
            return Json(new { success = false, message = "Lỗi: " + e.Message });
        }
    }

    // Xóa
    [HttpPost]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        try
        {
            var supplier = await _dbContext.Suppliers.FindAsync(id);
            if (supplier == null)
            {
                return Json(new { success = false, message = "Lỗi: Không tìm thấy nhà cung cấp có ID " + id });
            }

            _dbContext.Suppliers.Remove(supplier);
            await _dbContext.SaveChangesAsync();
            
            return Json(new { success = true, message = "Xóa nhà cung cấp thành công!" });
        }
        catch (Exception e)
        {
            return Json(new { success = false, message = "Lỗi: " + e.Message });
        }
            
    }
    
    public IActionResult Add()
    {
        return View();
    }
}