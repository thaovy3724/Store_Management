using StoreManagement.Models.Entities;

namespace StoreManagement.Models.Pages.Product
{
    public class ProductPageViewModel
    {
        public List<ProductViewModel> Products { get; set; }
        public AddProductViewModel NewProduct { get; set; }

        public List<Category>? Categories { get; set; }
        public List<Supplier>? Suppliers { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public string Search { get; set; }
        public int FilterCategory { get; set; }
        public decimal? PriceFrom { get; set; }
        public decimal? PriceTo { get; set; }

    }
}
