using StoreManagement.Models.Entities;
using System;
using System.Collections.Generic;

namespace StoreManagement.Models.ViewModels
{
    public class PromotionPageViewModel
    {
        public List<PromotionViewModel>? Promotions { get; set; }

        public int CurrentPage { get; set; } = 1;
        public int TotalPages { get; set; } = 1;
        public int PageSize { get; set; } = 5;

        public string? SearchTerm { get; set; }

        public string FilterStatus { get; set; }

        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }

        public IEnumerable<PromotionStatus>? StatusList { get; set; }
    }
}
