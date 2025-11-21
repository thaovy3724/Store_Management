using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreManagement.Models.Entities;

[Table("categories")]
public class Category
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("category_id")]
    public int CategoryId { get; set; }
    
    [Required]
    [StringLength(100)]
    [Column("category_name")]
    public string CategoryName { get; set; }
}