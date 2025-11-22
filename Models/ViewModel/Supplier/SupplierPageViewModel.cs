namespace StoreManagement.Models.ViewModel.Supplier
{
    public class SupplierPageViewModel
    {
        public IEnumerable<SupplierViewTableModel> Suppliers { get; set; }

        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }

        public string? Search { get; set; }
    }
}
