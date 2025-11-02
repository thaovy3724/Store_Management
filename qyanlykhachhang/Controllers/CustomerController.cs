using Microsoft.AspNetCore.Mvc;
using qyanlykhachhang.Database;
using qyanlykhachhang.Models.Enities;

namespace qyanlykhachhang.Controllers
{
    public class CustomerController : Controller
    {
        private readonly ApplicationDBContext _dbContext;

        public CustomerController(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult Index()
        {
            var customers = _dbContext.Customers.ToList();
            ViewBag.Customers = customers;
            return View();
        }

        [HttpGet]
        public IActionResult Add()
        {
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create([FromForm] Customer customer)
        {
            if (!ModelState.IsValid)
            {
                var customers = _dbContext.Customers.ToList();
                ViewBag.Customers = customers;
                return View("Index", customer);
            }

            if (customer.Id == Guid.Empty)
            {
                customer.Id = Guid.NewGuid();
            }

            _dbContext.Customers.Add(customer);
            _dbContext.SaveChanges();

            TempData["Success"] = "Thêm khách hàng thành công";
            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public IActionResult Details(Guid id)
        {
            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public IActionResult Edit(Guid id)
        {
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(Guid id, [FromForm] Customer input)
        {
            if (!ModelState.IsValid)
            {
                var customers = _dbContext.Customers.ToList();
                ViewBag.Customers = customers;
                return View("Index", input);
            }

            var customer = _dbContext.Customers.FirstOrDefault(x => x.Id == id);
            if (customer == null) return NotFound();

            customer.Name = input.Name;
            customer.PhoneNumber = input.PhoneNumber;
            customer.Email = input.Email;
            customer.Address = input.Address;
            customer.Subcribed = input.Subcribed;

            _dbContext.SaveChanges();
            TempData["Success"] = "Cập nhật khách hàng thành công";
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(Guid id)
        {
            var customer = _dbContext.Customers.FirstOrDefault(x => x.Id == id);
            if (customer == null) return NotFound();
            _dbContext.Customers.Remove(customer);
            _dbContext.SaveChanges();
            TempData["Success"] = "Đã xóa khách hàng";
            return RedirectToAction(nameof(Index));
        }
    }
}
