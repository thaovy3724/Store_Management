using StoreManagement.Models.Entities;
using StoreManagement.Models.ViewModel.OrderStaff;

namespace StoreManagement.Models.ViewModel.OrderStaff
{
    public class OrderStaffLoadViewPageModel
    {
        public List<Category>? Categories { get; set; }
        public List<OrderStaffLoadPromotionModel>? Promotions { get; set; }
        public List<OrderStaffLoadProductModel>? Products { get; set; }

    }
}
