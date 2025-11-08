namespace StoreManagement.Models.Entities
{
    public class Promotion
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Type { get; set; } // "percent" hoặc "fixed"
        public decimal Value { get; set; }
        public decimal MinOrderAmount { get; set; }
        public int UsageLimit { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
        public bool IsLocked { get; set; } = false;
    }

}
