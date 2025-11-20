namespace StoreManagement.Models.ViewModel.OrderStaff
{
    public class OrderStaffLoadProductModel
    {
        public string ProductName { get; set; }
        public string ProductImage { get; set; }
        public decimal Price { get; set; }
        public string Barcode { get; set; }
        public string Unit { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string CategoryName { get; set; }

    }
}
