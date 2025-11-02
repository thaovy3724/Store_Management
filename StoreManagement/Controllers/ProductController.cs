using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Utils;
using StoreManagement.Data;
using StoreManagement.Models;
using StoreManagement.Models.Entities;
using StoreManagement.Models.Pages.Product;

namespace StoreManagement.Controllers
{
    public class ProductController : Controller
    {
        private readonly StoreContext dbContext;
        private readonly IWebHostEnvironment _env;
        public ProductController(StoreContext context, IWebHostEnvironment env)
        {
            dbContext = context;
            _env = env;

        }
        // Lấy và hiển thị danh sách
        [HttpGet]
        public async Task<IActionResult> Index(
            int page = 1,
            int pageSize = 5,
            int categoryId = -1,
            string search = "",
            decimal? priceFrom = null,
            decimal? priceTo = null
        )
        {
            // --- 1. Lấy query cơ bản ---
            var query = dbContext.Products.AsQueryable();

            // --- 2. Áp dụng filter ---
            if (categoryId != -1)
                query = query.Where(p => p.CategoryId == categoryId);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(p => p.ProductName.Contains(search));

            if (priceFrom.HasValue)
                query = query.Where(p => p.Price >= priceFrom.Value);

            if (priceTo.HasValue)
                query = query.Where(p => p.Price <= priceTo.Value);

            // --- 3. Lấy danh sách ProductViewModel ---
            var allProducts = await query
                .OrderBy(p => p.ProductName)
                .Select(p => new ProductViewModel
                {
                    ProductName = p.ProductName,
                    ProductImage = p.ProductImage,
                    Price = p.Price,
                    Barcode = p.Barcode,
                    Unit = p.Unit
                })
                .ToListAsync();

            // --- 4. Phân trang bằng class chung ---
            var paged = Pagination<ProductViewModel>.Create(allProducts, page, pageSize);

            // --- 5. Tạo ViewModel trả về View ---
            var viewModel = new ProductPageViewModel
            {
                Products = paged.Items,
                Categories = await dbContext.Categories.ToListAsync(),
                Suppliers = await dbContext.Suppliers.ToListAsync(),
                CurrentPage = paged.CurrentPage,
                TotalPages = paged.TotalPages,
                Search = search,
                FilterCategory = categoryId,
                PriceFrom = priceFrom,
                PriceTo = priceTo
            };

            return View(viewModel);
        }


        // Xử lý ảnh
        private string? UploadImage(IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
                return null;

            var extension = Path.GetExtension(imageFile.FileName).ToLower();
            var newFileName = "SP_" + Guid.NewGuid().ToString("N") + extension;

            // 📂 Đường dẫn tuyệt đối đến thư mục uploads
            var uploadPath = Path.Combine(_env.WebRootPath, "uploads");

            // ✅ Nếu thư mục chưa tồn tại thì tạo
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            // 📄 Đường dẫn đầy đủ của file
            var filePath = Path.Combine(uploadPath, newFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                imageFile.CopyTo(stream);
            }

            // 👉 Trả về đường dẫn tương đối (để lưu DB)
            return newFileName;
        }
        // Thêm 
        [HttpPost]
        public async Task<IActionResult> Add([FromForm] AddProductViewModel model)
        {
            // check if the product exists by barcode
            var existingProduct = await dbContext.Products
                .FirstOrDefaultAsync(p => p.Barcode == model.Barcode);

            if (existingProduct != null)
            {
                return Json(new { success = false, message = "Sản phẩm với mã vạch này đã tồn tại." });
            }

            // Upload image file
            var newFileName = UploadImage(model.ImageFile);
            if(newFileName == null)
            {
                return Json(new { success = false, message = "Lỗi khi tải lên hình ảnh sản phẩm." });
            }

            // Map ViewModel -> Entity
            var newProduct = new Product
            {
                ProductName = model.ProductName,
                ProductImage = newFileName,
                CategoryId = model.CategoryId,
                SupplierId = model.SupplierId,
                Price = model.Price,
                Unit = model.Unit,
                Barcode = model.Barcode,
                CreatedAt = DateTime.Now,
                Inventory = new Inventory
                {
                    Quantity = model.InventoryQuantity,
                    UpdatedAt = DateTime.Now,
                }
            };

            dbContext.Products.Add(newProduct);
            await dbContext.SaveChangesAsync();
            return Json(new
            {
                success = true,
                message = "Thêm sản phẩm thành công.",
                product = new
                {
                    barcode = newProduct.Barcode,
                    image = newProduct.ProductImage,
                    name = newProduct.ProductName,
                    price = newProduct.Price,
                    unit = newProduct.Unit
                }
            });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromForm] AddProductViewModel model)
        {
            // Lấy sản phẩm + Inventory
            var product = await dbContext.Products
                .Include(p => p.Inventory) // ✅ thêm dòng này
                .SingleOrDefaultAsync(p => p.Barcode == model.Barcode);

            if (product == null)
            {
                return Json(new { success = false, message = "Sản phẩm không tồn tại." });
            }

            // Upload ảnh (nếu có)
            var newFileName = UploadImage(model.ImageFile);
            if (newFileName != null)
            {
                product.ProductImage = newFileName;
            }

            // Cập nhật thông tin sản phẩm
            product.ProductName = model.ProductName;
            product.CategoryId = model.CategoryId;
            product.SupplierId = model.SupplierId;
            product.Price = model.Price;
            product.Unit = model.Unit;

            // Cập nhật tồn kho (có thể Inventory null)
            if (product.Inventory == null)
            {
                product.Inventory = new Inventory
                {
                    ProductId = product.ProductId,
                    Quantity = model.InventoryQuantity,
                    UpdatedAt = DateTime.Now
                };
            }
            else
            {
                product.Inventory.Quantity = model.InventoryQuantity;
                product.Inventory.UpdatedAt = DateTime.Now;
            }

            await dbContext.SaveChangesAsync();
            return Json(new
            {
                success = true,
                message = "Chỉnh sửa sản phẩm thành công.",
                product = new
                {
                    barcode = product.Barcode,
                    image = product.ProductImage, 
                    name = product.ProductName,
                    price = product.Price,
                    unit = product.Unit
                }
            });
        }

        [HttpPost]
        public async Task<IActionResult> Delete(String barcode)
        {
            if(String.IsNullOrEmpty(barcode))
            {
                return Json(new { success = false, message = "Mã vạch không được để trống." });
            }

            // *** Business logic to delete product by barcode ***
            // Find product
            var product = await dbContext.Products.SingleOrDefaultAsync(p => p.Barcode == barcode);
            if(product == null)
            {
                return Json(new { success = false, message = "Sản phẩm không tồn tại." });
            }
            else
            {
                // Check if product exists in order item
                if (await dbContext.OrderItems.AnyAsync(oi => oi.ProductId == product.ProductId))
                {
                    return Json(new { success = false, message = "Sản phẩm đã được bán, không thể xóa." });
                }
                else {
                    // Check if product exists in inventory and has quantity > 0
                    if( await dbContext.Inventories.AnyAsync(i => i.ProductId == product.ProductId && i.Quantity > 0))
                    {
                        return Json(new { success = false, message = "Sản phẩm còn tồn kho, không thể xóa." });
                    }
                }
            }

            // If checks pass, delete product
            dbContext.Products.Remove(product);
            await dbContext.SaveChangesAsync(); 
            return Json(new { success = true, message = "Xóa sản phẩm thành công" }); 
        }

        [HttpGet]
        public async Task<IActionResult> Detail(String barcode)
        {
            if (String.IsNullOrEmpty(barcode))
            {
                return Json(new { success = false, message = "Mã vạch không được để trống." });
            }

            // *** Business logic to delete product by barcode ***
            // Find product
            var product = await dbContext.Products
                .Include(p => p.Inventory)
                .SingleOrDefaultAsync(p => p.Barcode == barcode);

            if (product == null)
            {
                return Json(new { success = false, message = "Sản phẩm không tồn tại." });
            }
            
            // Map from entity to AddProductViewModel
            var viewModel = new AddProductViewModel
            {
                ProductName = product.ProductName,
                ProductImage = product.ProductImage,
                CategoryId = product.CategoryId,
                SupplierId = product.SupplierId,
                Price = product.Price,
                Unit = product.Unit,
                Barcode = product.Barcode,
                InventoryQuantity = product.Inventory != null ? product.Inventory.Quantity : 0
            };
            return Json(new { success = true,viewModel});
        }
    }
}
