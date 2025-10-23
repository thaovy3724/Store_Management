using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;
using StoreManagement.Models;
using StoreManagement.Models.Pages.Product;

namespace StoreManagement.Controllers
{
    public class ProductController : Controller
    {
        private readonly StoreContext dbContext;

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var products = await dbContext.Products.Select( p => new ProductViewModel
            {
                ProductName = p.ProductName,
                ProductImage = p.ProductImage,
                Price = p.Price,
                Barcode = p.Barcode,
                Unit = p.Unit
            }).ToListAsync();

            var viewModel = new ProductPageViewModel
            {
                // Initialize any properties if needed
                Products = products
            };
            return View(viewModel);
        }

        [HttpPost]
        public IActionResult Add()
        {

        }

        [HttpPost]
        public IActionResult Delete(String barcode)
        {
            if(String.IsNullOrEmpty(barcode))
            {
                return BadRequest("Thiếu barcode.");
            }


        }
    }
}
