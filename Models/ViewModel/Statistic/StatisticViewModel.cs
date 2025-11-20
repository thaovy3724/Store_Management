namespace StoreManagement.Models.ViewModel.Statistic;

public class StatisticViewModel
{
    public class RevenueByMonthVM
    {
        public int Month { get; set; }
        public decimal Revenue { get; set; }
    }

    public class TopProductVM
    {
        public string ProductName { get; set; }
        public int QuantitySold { get; set; }
    }

    public class TopCustomerVM
    {
        public string CustomerName { get; set; }
        public decimal TotalSpent { get; set; }
    }

    public class StatisticOverviewVM
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int NewCustomers { get; set; }
        public int ProductsSold { get; set; }
    }
}