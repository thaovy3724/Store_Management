using Microsoft.EntityFrameworkCore;
using StoreManagement.Models.Entities;

namespace StoreManagement.Data
{
    public class StoreContext:DbContext
    {
        public StoreContext(DbContextOptions<StoreContext> options) : base(options) { }
        public DbSet<Product> Products { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Promotion> Promotions { get; set; }
    }
}
