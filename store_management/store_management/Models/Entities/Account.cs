using System.ComponentModel.DataAnnotations;

namespace store_management.Models.Entities
{
    public class Account
    {
        [Key]
        public int accountId { get; set; }

        [Required(ErrorMessage = "Username cannot be blank")]
        public string username { get; set; }

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [DataType(DataType.Password)]
        public string password { get; set; }

        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress]
        public string email { get; set; }

        public string role { get; set; } = "User"; // Admin hoặc User

        public DateTime createdAt { get; set; } = DateTime.Now;


    }
}
