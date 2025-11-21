using StoreManagement.Models.Entities;

namespace StoreManagement.Models.ViewModel.OrderStaff
{
    public class OrderStaffLoadPromotionModel
    {
        public int PromotionId { get; set; }
        public string PromotionCode { get; set; }
        public string Description { get; set; }
        public decimal DiscountValue { get; set; }
        public DiscountType DiscountType { get; set; }
        public int usageLimit { get; set; }
        public DateTime EndDate { get; set; }
        public Decimal MinOrderAmount { get; set; }
    }
}
