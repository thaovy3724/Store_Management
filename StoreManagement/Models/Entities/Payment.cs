using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreManagement.Models.Entities;

[Table("payments")]
public class Payment
{
    [Key]
    [Column("payment_id")]
    public int PaymentId { get; set; }

    [Required]
    [Column("order_id")]
    public int OrderId { get; set; }

    [Required]
    [Column("amount", TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }

    [Column("payment_method")]
    [StringLength(20)]
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash; 
    // "cash", "card", "bank_transfer", "e-wallet"
    
    // Navigation Properties
    // 1 payment - 1 order
    public Order? Order { get; set; }

}