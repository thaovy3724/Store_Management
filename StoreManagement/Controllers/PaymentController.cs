using Microsoft.AspNetCore.Mvc;

namespace StoreManagement.Controllers
{
    public class PaymentController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
