using StoreManagement.Models.Entities;

namespace StoreManagement.Models.Pages.Orders
{
    public class OrdersViewTableModel
    {
        public int OrderId { get; set; }
        public required string CustomerName { get; set; }
        public DateTime OrderDate { get; set; }
        public Decimal TotalAmount { get; set; }
        public PaymentMethod PaymentMethod { get; set; }

    }
}
