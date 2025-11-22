using StoreManagement.Models.Entities;

namespace StoreManagement.Models.ViewModels
{
    public class PromotionViewModel
    {
        public int PromoId { get; set; }
        public string PromoCode { get; set; } = string.Empty;
        public DiscountType DiscountType { get; set; }
        public string? Description { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal MinOrderAmount { get; set; }
        public int UsageLimit { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public PromotionStatus Status { get; set; }

        // Hiển thị giá trị đẹp
        public string ValueDisplay =>
            DiscountType == DiscountType.Percent ? $"{DiscountValue}%" : $"{DiscountValue:N0} đ";

        // Hiển thị khoảng thời gian
        public string PeriodDisplay =>
            $"{StartDate:dd/MM/yyyy} → {EndDate:dd/MM/yyyy}";

        public string StatusText =>
            Status switch
            {
                PromotionStatus.Active => "Hoạt động",
                PromotionStatus.Inactive => "Đã khóa",
                _ => "Khác"
            };
    }
}
