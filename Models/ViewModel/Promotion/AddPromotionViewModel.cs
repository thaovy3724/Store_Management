using System;
using System.ComponentModel.DataAnnotations;

namespace StoreManagement.Models.ViewModels
{
    public class AddPromotionViewModel
    {
        [Required, StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = "percent"; // "percent" hoặc "fixed"

        [Required, Range(0.01, double.MaxValue)]
        public decimal Value { get; set; }

        [Required, Range(0, double.MaxValue)]
        public decimal MinOrderAmount { get; set; }

        [Required, Range(0, int.MaxValue)]
        public int UsageLimit { get; set; }

        [Required, DataType(DataType.Date)]
        public DateTime StartDate { get; set; }

        [Required, DataType(DataType.Date)]
        public DateTime EndDate { get; set; }
    }
}
