namespace StoreManagement.Models.ViewModel.Customer
{
    public class CustomerPageViewModel
    {
        public IEnumerable<CustomerViewTableModel> Customers { get; set; }

        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }

        // Filters
        public string Search { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }

}
