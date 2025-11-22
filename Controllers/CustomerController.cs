using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models.Entities;
using StoreManagement.Models.ViewModel.Customer;
using StoreManagement.Models.ViewModel.Utils;

namespace StoreManagement.Controllers;

public class CustomerController(ApplicationDbContext _dbContext) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(
    int page = 1,
    int pageSize = 2,
    string search = "",
    DateTime? dateFrom = null,
    DateTime? dateTo = null)
    {
        // Query cơ bản
        var query = _dbContext.Customers.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c =>
                c.Name.Contains(search) ||
                c.CustomerId.ToString().Contains(search) ||
                (c.Phone != null && c.Phone.Contains(search)) ||
                (c.Email != null && c.Email.Contains(search))
            );
        }

        // Lọc theo ngày tạo (from)
        if (dateFrom.HasValue)
            query = query.Where(c => c.CreatedAt >= dateFrom.Value);

        // Lọc theo ngày tạo (to)
        if (dateTo.HasValue)
            query = query.Where(c => c.CreatedAt <= dateTo.Value);

        // Select ra ViewModel
        var customerList = await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CustomerViewTableModel
            {
                CustomerId = c.CustomerId,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                Address = c.Address,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        // Phân trang
        var pagedCustomers = Pagination<CustomerViewTableModel>.Create(customerList, page, pageSize);

        // Gom vào PageViewModel
        var viewModel = new CustomerPageViewModel
        {
            Customers = pagedCustomers.Items,
            CurrentPage = pagedCustomers.CurrentPage,
            TotalPages = pagedCustomers.TotalPages,
            Search = search,
            DateFrom = dateFrom,
            DateTo = dateTo
        };

        return View(viewModel);
    }


    // GET - Customer/GetCustomers
    [HttpGet]
    public async Task<IActionResult> GetCustomers()
    {
        var customers = await _dbContext.Customers
            .OrderBy(c => c.CustomerId)
            .ToListAsync();
        return Json(new { success = true, data = customers });
    }
    
    // GET -  Customer/GetCustomer
    [HttpGet]
    public async Task<IActionResult> GetCustomer(int id)
    {
        var customer = await _dbContext.Customers.FindAsync(id);
        if (customer == null)
        {
            return Json(new { success = false, message = "Không tìm thấy khách hàng!" });
        }

        return Json(new { success = true, data = customer });
    }
    
    // POST Customer/Create - Thêm 1 khách hàng mới
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Customer model)
    {

        
        // Kiểm tra customer đã tồn tại chưa
        var existingCustomer = await _dbContext.Customers.FirstOrDefaultAsync(c =>
            c.Phone == model.Phone
        );

        if (existingCustomer != null)
        {
            return Json(new { success = false, message = "Khách hàng đã tồn tại!" });
        }

        _dbContext.Customers.Add(model);
        await _dbContext.SaveChangesAsync();
        
        return Json(new { success = true, message = "Thêm khách hàng thành công" });
    }
    
    // POST - Customer/Edit/{id}
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, Customer model)
    {
        // Kiểm tra khách hàng đã tồn tại chưa
        var customer = await _dbContext.Customers.FindAsync(id);

        if (customer == null)
        {
            return Json(new { success = false, message = "Không tìm thấy khách hàng!" });
        }
        
        // Kiểm tra trùng thông tin (bằng sđt)
        var existingCustomer = await _dbContext.Customers.FirstOrDefaultAsync(c => 
            c.Phone == model.Phone  &&
            c.CustomerId != id // Customer đang kiểm tra phải != customer đang cập nhật
        );

        if (existingCustomer != null)
        {
            return Json(new { success = false, message = "Thông tin khách hàng bị trùng!" });
        }
        
        // Cập nhật thông tin
        customer.Name = model.Name;
        customer.Phone = model.Phone;
        customer.Email = model.Email;
        customer.Address = model.Address;
        
        await _dbContext.SaveChangesAsync();

        return Json(new { success = true, message = $"Cập nhật khách hàng có id {id} thành công" });
    }
    
    // POST - Customer/Delete/{id}
    [HttpPost]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var customer = await _dbContext.Customers.FindAsync(id);
            if (customer == null)
            {
                return Json(new { success = true, message = $"Lỗi tìm thấy khách hàng có id {id}" });
            }

            _dbContext.Customers.Remove(customer);
            await _dbContext.SaveChangesAsync();

            return Json(new { success = true, message = $"Xóa khách hàng có id {id} thành công!" });
        }
        catch (Exception e)
        {
            return Json(new { success = false, message = $"Xóa khách hàng có id {id} thất bại. Lỗi: {e.Message}" });
        }
    }
    
    // Search
    [HttpGet]
    public async Task<IActionResult> Search(string searchTerm)
    {
        try
        {
            var customers = await _dbContext.Customers
                .Where(c => string.IsNullOrEmpty(searchTerm) || c.Name.Contains(searchTerm) || c.Phone.Contains(searchTerm) || c.Email.Contains(searchTerm))
                .OrderBy(c => c.CustomerId)
                .ToListAsync();

            return Json(new { success = true, data = customers });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
        }
    }
}