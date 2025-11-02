using Microsoft.EntityFrameworkCore;
using qyanlykhachhang.Models.Enities;

namespace qyanlykhachhang.Database
{
    public class ApplicationDBContext: DbContext
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options ): base(options)
        {
        }
        public DbSet <Customer> Customers { get; set; }

    }
}
