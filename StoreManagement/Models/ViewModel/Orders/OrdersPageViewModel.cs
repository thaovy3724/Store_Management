
using StoreManagement.Models.Entities;

namespace StoreManagement.Models.Pages.Orders
{
    public class OrdersPageViewModel
    {
        public List<OrdersViewTableModel> Orders { get; set; }
        public List<OrdersViewDetailModel> OrdersDetail { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public string Search { get; set; }
        public decimal? PriceFrom { get; set; }
        public decimal? PriceTo { get; set; }

        public PaymentMethod? PaymentMethod { get; set; }
    }
}
