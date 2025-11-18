using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreManagement.Models.Entities;

[Table("users")]
public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int UserId { get; set; }
    
    [Required]
    [StringLength(50)]
    [Column("username")]
    public string Username { get; set; }
    
    
    [Required]
    [StringLength(255)]
    [Column("password")]
    public string Password { get; set; }
    
    [StringLength(100)]
    [Column("full_name")]
    public string FullName { get; set; }

    [Required] [Column("role")] 
    public Role Role { get; set; } = Role.Staff;

    [Column("created_at")] 
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    // Navigation Properties
    // 1 user - n orders
    public ICollection<Order>? Orders { get; set; }
}