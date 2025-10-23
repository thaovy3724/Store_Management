namespace StoreManagement.Models.Entities
{
    public class Product
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductImage { get; set; }
        public string CategoryId { get; set; }
        public string SupplierId { get; set; }
        public decimal Price { get; set; }
        public string Unit { get; set; }
        public string Barcode { get; set; }
        public DateTime CreatedAt { get; set; }

        // bidrectional navigation properties
        public Category Category { get; set; }
        public Supplier Supplier { get; set; }
        public Inventory Inventory { get; set; }

    }
}
