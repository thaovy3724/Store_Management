using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient();

// Inject DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(
    builder.Configuration.GetConnectionString("StoreManagement")    
));

// Cấu hình Session
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
builder.Services.AddHttpContextAccessor();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// Thêm middleware Session
app.UseSession();
app.UseHttpsRedirection();
app.UseStaticFiles(); 
app.UseRouting();
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? string.Empty;

    // Bỏ qua các trang login/logout và các URL thanh toán test
    if (!path.StartsWith("/Auth", StringComparison.OrdinalIgnoreCase) &&
        !path.Contains("momo", StringComparison.OrdinalIgnoreCase) &&
        !path.Contains("vnpayment", StringComparison.OrdinalIgnoreCase))
    {
        var username = context.Session.GetString("Username");
        var role = context.Session.GetString("Role");

        // Nếu chưa đăng nhập
        if (string.IsNullOrEmpty(username))
        {
            context.Response.Redirect("/Auth");
            return;
        }

        // Nếu đã login
        if (!string.IsNullOrEmpty(role))
        {
            switch (role)
            {
                case "Staff":
                    // Staff chỉ được vào /OrderStaff
                    if (!path.StartsWith("/OrderStaff", StringComparison.OrdinalIgnoreCase) &&
                        !path.StartsWith("/Customer", StringComparison.OrdinalIgnoreCase))
                    {
                        context.Response.Redirect("/OrderStaff");
                        return;
                    }
                    break;

                case "Admin":
                    // Admin không được vào /OrderStaff
                    if (path.StartsWith("/OrderStaff", StringComparison.OrdinalIgnoreCase))
                    {
                        context.Response.Redirect("/Statistic");
                        return;
                    }
                    break;
            }
        }
    }

    await next();
});

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
        // TODO: Thống kê hiện đầu tiên
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();