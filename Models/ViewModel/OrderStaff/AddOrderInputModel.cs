using StoreManagement.Models.Entities;

namespace StoreManagement.Models.ViewModel.OrderStaff
{
    public class AddOrderInputModel
    {
        public int CustomerId { get; set; }
        public int UserId { get; set; }
        public int? PromoId { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public OrderStatus OrderStatus { get; set; }
        public PaymentMethod PaymentMethod { get; set; }

        public List<OrderItemInputModel> OrderItems { get; set; }
    }

    public class OrderItemInputModel
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
