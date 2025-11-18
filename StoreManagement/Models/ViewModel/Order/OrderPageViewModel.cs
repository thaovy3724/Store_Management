namespace StoreManagement.Models.ViewModel.Order;

public class OrderPageViewModel
{
    public List<OrderViewTableModel> Orders { get; set; }
    public List<OrderViewDetailModel> OrdersDetail { get; set; }
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public string Search { get; set; }
    public int? Status { get; set; }
    public decimal? PriceFrom { get; set; }
    public decimal? PriceTo { get; set; }
}