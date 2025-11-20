using Microsoft.EntityFrameworkCore;
using StoreManagement.Models.Entities;

namespace StoreManagement.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options): base(options)
    {
    }
    
    // Map kiểu enum (int) -> string (database)
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // USER.role
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>()      
            .HasMaxLength(20)             
            .HasColumnName("role");

        // ORDER.status
        modelBuilder.Entity<Order>()
            .Property(o => o.Status)
            .HasConversion<string>()
            .HasMaxLength(10)
            .HasColumnName("status");

        // PAYMENT.payment_method
        modelBuilder.Entity<Payment>()
            .Property(p => p.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasColumnName("payment_method");

        // PROMOTION.discount_type
        modelBuilder.Entity<Promotion>()
            .Property(p => p.DiscountType)
            .HasConversion<string>()
            .HasMaxLength(10)
            .HasColumnName("discount_type");

        // PROMOTION.status
        modelBuilder.Entity<Promotion>()
            .Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(10)
            .HasColumnName("status");
        
        base.OnModelCreating(modelBuilder);
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Inventory> Inventory { get; set; }
    public DbSet<Promotion> Promotions { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Payment> Payments { get; set; }
}