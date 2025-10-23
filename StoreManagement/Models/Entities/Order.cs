namespace StoreManagement.Models.Entities
{
    public class Order
    {
        public int OrderId { get; set; }
        public int CustomerId { get; set; }
        public int UserId { get; set; }
        public int PromoId { get; set; }
        public DateTime OrderDate { get; set; }
        public OrderStatus Status { get; set; }

        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
    }
}
