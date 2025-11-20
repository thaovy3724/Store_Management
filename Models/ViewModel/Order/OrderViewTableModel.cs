using StoreManagement.Models.Entities;

namespace StoreManagement.Models.ViewModel.Order;

public class OrderViewTableModel
{
    public int OrderId { get; set; }
    public required string CustomerName { get; set; }
    public DateTime OrderDate { get; set; }
    public Decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
}