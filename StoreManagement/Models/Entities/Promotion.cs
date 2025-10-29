namespace StoreManagement.Models.Entities
{
    public class Promotion
    {
        public int PromotionId { get; set; }
        public string PromotionCode { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DiscountType DiscountType { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal MinOrderAmount { get; set; }
        public int usageLimit { get; set; }
        public int usedCount { get; set; }
        public PromotionStatus Status { get; set; }
    }
}
