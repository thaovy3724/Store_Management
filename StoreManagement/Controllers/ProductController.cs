using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models;
using StoreManagement.Models.Entities;
using StoreManagement.Models.Pages.Product;

namespace StoreManagement.Controllers
{
    public class ProductController : Controller
    {
        private readonly StoreContext dbContext;

        public ProductController(StoreContext context)
        {
            dbContext = context;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var products = await dbContext.Products.Select(p => new ProductViewModel
            {
                ProductName = p.ProductName,
                ProductImage = p.ProductImage,
                Price = p.Price,
                Barcode = p.Barcode,
                Unit = p.Unit
            }).ToListAsync();

            var allCategories = await dbContext.Categories.ToListAsync();
            var allSuppliers = await dbContext.Suppliers.ToListAsync();

            var viewModel = new ProductPageViewModel
            {
                // Initialize any properties if needed
                Products = products,
                Categories = allCategories,
                Suppliers = allSuppliers
            };
            return View(viewModel);
        }

        private string? UploadImage(IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
                return null; // hoặc ném exception

            // Lấy extension file
            var extension = Path.GetExtension(imageFile.FileName).ToLower();

            // Tạo tên file mới
            var newFileName = "SP_" + Guid.NewGuid().ToString("N") + extension;

            // Tạo đường dẫn lưu file
            var filePath = Path.Combine("../wwwroot/uploads/", newFileName);

            // Lưu file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                imageFile.CopyTo(stream);
            }

            return newFileName;
        }

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
                Inventory = new Inventory
                {
                    Quantity = model.InventoryQuantity,
                }
            };

            dbContext.Products.Add(newProduct);
            await dbContext.SaveChangesAsync();
            return Json(new { success = true, message = "Thêm sản phẩm thành công." });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromForm] AddProductViewModel model)
        {
            var product = await dbContext.Products
                .SingleOrDefaultAsync(p => p.Barcode == model.Barcode);

            if (product == null)
            {
                return Json(new { success = false, message = "Sản phẩm không tồn tại." });
            }
            // Upload image file
            var newFileName = UploadImage(model.ImageFile);
            if (newFileName != null)
            {
                product.ProductImage = newFileName;
            }

            product.ProductName = model.ProductName;
            product.CategoryId = model.CategoryId;
            product.SupplierId = model.SupplierId;
            product.Price = model.Price;    
            product.Unit = model.Unit;
            product.Inventory.Quantity = model.InventoryQuantity;

            await dbContext.SaveChangesAsync();
            return Json(new { success = true, message = "Chỉnh sửa sản phẩm thành công." });
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
            return Json(new { success = false, message = "Xóa sản phẩm thành công" }); 
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
            return Json(new { success = true, viewModel = viewModel });
        }
    }
}
