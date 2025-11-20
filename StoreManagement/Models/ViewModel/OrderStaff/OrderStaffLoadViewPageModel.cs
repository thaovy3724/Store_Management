using StoreManagement.Models.Entities;
using StoreManagement.Models.ViewModel.OrderStaff;

namespace StoreManagement.Models.ViewModel.OrderStaff
{
    public class OrderStaffLoadViewPageModel
    {
        public List<Category>? Categories { get; set; }
        public List<OrderStaffLoadPromotionModel>? Promotions { get; set; }
        public List<OrderStaffLoadProductModel>? Products { get; set; }

        // Các thuộc tính hỗ trợ phân trang + tìm kiếm
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public string Search { get; set; }
        public int? SelectedCategoryId { get; set; }

    }
}
