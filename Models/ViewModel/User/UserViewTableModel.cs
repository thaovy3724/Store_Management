using StoreManagement.Models.Entities;

namespace StoreManagement.Models.ViewModel.User
{
    public class UserViewTableModel
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public Role Role { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
