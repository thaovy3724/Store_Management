namespace StoreManagement.Models.Pages.Product
{
    public class AddProductViewModel
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductImage { get; set; }
        public string CategoryId { get; set; }
        public string SupplierId { get; set; }
        public decimal Price { get; set; }
        public string Unit { get; set; }
        public string Barcode { get; set; }
    }
}
