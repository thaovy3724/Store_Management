namespace StoreManagement.Models.Entities
{
    public class User
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public Role Role { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
