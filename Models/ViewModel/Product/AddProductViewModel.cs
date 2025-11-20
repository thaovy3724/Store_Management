using StoreManagement.Models.Entities;

namespace StoreManagement.Models.Pages.Product
{
    public class AddProductViewModel
    {
        public string ProductName { get; set; }
        public string ProductImage { get; set; }
        public int CategoryId { get; set; }
        public int SupplierId { get; set; }
        public decimal Price { get; set; }
        public string Unit { get; set; }
        public string Barcode { get; set; }

        public int InventoryQuantity{ get; set; }

        // Use for upload image file
        public IFormFile ImageFile { get; set; }

    }
}
