using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

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
    var path = context.Request.Path.Value?.ToLower();

    // Nếu chưa đăng nhập và không phải đang ở trang login
    if (!path.Contains("/auth") && !path.Contains("/auth/logout"))
    {
        var username = context.Session.GetString("Username");
        var role = context.Session.GetString("Role");

        if (string.IsNullOrEmpty(username))
        {
            context.Response.Redirect("/Auth");
            return;
        }

        if (!string.IsNullOrEmpty(role))
        {
            // Staff chỉ được vào /OrderStaff
            if (role == "Staff" && !path.StartsWith("/orderstaff"))
            {
                context.Response.Redirect("/orderstaff");
                return;
            }

            // Admin không được vào /OrderStaff
            if (role == "Admin" && path.StartsWith("/orderstaff"))
            {
                context.Response.Redirect("/statistic");
                return;
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