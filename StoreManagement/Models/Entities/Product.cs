using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreManagement.Models.Entities;

[Table("products")]
public class Product
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("product_id")]
    public int ProductId { get; set; }

    [Column("category_id")]
    public int? CategoryId { get; set; }

    [Column("supplier_id")]
    public int? SupplierId { get; set; }

    [Required]
    [StringLength(100)]
    [Column("product_name")]
    public string ProductName { get; set; }

    [StringLength(50)]
    [Column("barcode")]
    public string Barcode { get; set; }

    [Required]
    [Column("price", TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }

    [StringLength(20)]
    [Column("unit")]
    public string Unit { get; set; } = "pcs";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    // Navigation Properties
    // 1 product - 1 category
    public Category? Category { get; set; }
    // 1 product - 1 supplier
    public Supplier? Supplier { get; set; }
    // 1 product - 1 inventory
    public Inventory? Inventory { get; set; }
    // 1 product - n order_items
    public ICollection<OrderItem>? OrderItems { get; set; }
}