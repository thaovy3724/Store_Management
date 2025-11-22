namespace StoreManagement.Models.ViewModel.Category
{
    public class CategoryPageViewModel
    {
        public IEnumerable<CategoryViewTableModel> Categories { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }

        public string Search { get; set; }
    }
}
