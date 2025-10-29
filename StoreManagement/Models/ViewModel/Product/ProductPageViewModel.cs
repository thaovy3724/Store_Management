using StoreManagement.Models.Entities;

namespace StoreManagement.Models.Pages.Product
{
    public class ProductPageViewModel
    {
        public List<ProductViewModel> Products { get; set; }
        public AddProductViewModel NewProduct { get; set; }

        public List<Category>? Categories { get; set; }
        public List<Supplier>? Suppliers { get; set; }
    }
}
