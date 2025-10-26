using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreManagement.Models.Entities
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required, StringLength(50)]
        [Column("username")]
        public string Username { get; set; } = string.Empty;

        [Required, StringLength(255)]
        [Column("password")]
        public string Password { get; set; } = string.Empty;

        [StringLength(100)]
        [Column("full_name")]
        public string? FullName { get; set; }

        [StringLength(10)]
        [Column("role")]
        public string Role { get; set; } = "staff";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}
