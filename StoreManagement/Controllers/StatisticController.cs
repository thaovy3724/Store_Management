using Microsoft.AspNetCore.Mvc;

namespace StoreManagement.Controllers
{
    public class StatisticController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
