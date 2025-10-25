using Microsoft.EntityFrameworkCore;
using store_management.Models.Entities;

namespace store_management.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
        {
            
        }
        public DbSet<Account> Accounts { get; set; }
    }
}
