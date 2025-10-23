namespace StoreManagement.Models.Entities
{
    public class Inventory
    {
        public int InventoryId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public DateTime UpdatedAt { get; set; }

        //bidirectional navigation property
        public Product Product { get; set; }
    }
}
