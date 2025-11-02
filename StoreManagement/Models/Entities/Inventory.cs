using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreManagement.Models.Entities;

// Tồn kho
[Table("inventory")]
public class Inventory
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("inventory_id")]
    public int InventoryId { get; set; }

    [Required]
    [Column("product_id")]
    public int ProductId { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; } = 0;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
    
    // Navigation Properties
    // 1 inventory - 1 product
    public Product? Product { get; set; }
}