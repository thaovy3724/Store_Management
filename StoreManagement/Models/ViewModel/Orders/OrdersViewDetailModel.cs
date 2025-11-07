using StoreManagement.Models.Entities;

namespace StoreManagement.Models.Pages.Orders
{
    public class OrdersViewDetailModel
    {
        // Danh sách sản phẩm trong đơn hàng
        public List<OrderItemDetail> Items { get; set; } = new();

        // Thông tin Order
        public required string CustomerName { get; set; }
        public required string UserName { get; set; }
        public DateTime OrderDate { get; set; }

        // Thông tin Payment
        public PaymentMethod PaymentMethod { get; set; }

        // Tổng tiền, giảm giá, mã giảm giá
        public Decimal TotalAmount { get; set; }
        public Decimal DiscountAmount { get; set; }
        public string PromotionCode { get; set; } = "-";
        public Decimal FinalAmount => TotalAmount - DiscountAmount;
    }

    // Class phụ để hiển thị chi tiết từng OrderItem
    public class OrderItemDetail
    {
        public string ProductName { get; set; }
        public string ProductImage { get; set; }
        public Decimal Price { get; set; }
        public int Quantity { get; set; }
        public Decimal SubTotal { get; set; }
    }
}
