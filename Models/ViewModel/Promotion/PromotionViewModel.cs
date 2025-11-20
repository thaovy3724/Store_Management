using System;

namespace StoreManagement.Models.ViewModels
{
    public class PromotionViewModel
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "percent" hoặc "fixed"
        public decimal Value { get; set; }
        public decimal MinOrderAmount { get; set; }
        public int UsageLimit { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // Format để hiển thị đẹp trên View (optional)
        public string ValueDisplay =>
            Type == "percent" ? $"{Value}%" : $"{Value:N0} đ";

        public string PeriodDisplay =>
            $"{StartDate:yyyy-MM-dd} → {EndDate:yyyy-MM-dd}";
    }
}
