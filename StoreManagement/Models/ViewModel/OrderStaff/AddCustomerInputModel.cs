using System.ComponentModel.DataAnnotations;

namespace StoreManagement.Models.ViewModel.OrderStaff
{
    public class AddCustomerInputModel
    {
        [Required(ErrorMessage = "Tên khách hàng không được để trống")]
        public string Name { get; set; }
        [Required(ErrorMessage = "Số điện thoại không được để trống")]
        public string Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
    }
}