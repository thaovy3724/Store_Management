using StoreManagement.Models.Entities;

namespace StoreManagement.Models.ViewModel.User
{
    public class UserPageViewModel
    {
        public IEnumerable<UserViewTableModel> Users { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }

        public string Search { get; set; }
        public Role? Role { get; set; }
    }
}
