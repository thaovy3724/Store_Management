using Microsoft.EntityFrameworkCore;
using StoreManagement.Models.Entities;

namespace StoreManagement.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options): base(options)
    {
    }

    public DbSet<Supplier> Suppliers { get; set; }
}