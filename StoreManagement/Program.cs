using Microsoft.EntityFrameworkCore;
using StoreManagement.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient();
builder.Services.AddDbContext<StoreContext>(options => options.UseSqlServer(
    builder.Configuration.GetConnectionString("StoreConnect")
));
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // thời gian tồn tại session
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
app.UseSession();
app.UseHttpsRedirection();
app.UseStaticFiles(); // mặc định cho wwwroots
app.UseRouting();
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLower();

    // Nếu chưa đăng nhập và không phải đang ở trang login
    if (!path.Contains("/auth/login") && !path.Contains("/auth/logout"))
    {
        var username = context.Session.GetString("Username");
        if (string.IsNullOrEmpty(username))
        {
            context.Response.Redirect("/Auth/Login");
            return;
        }
    }

    await next();
});


app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
