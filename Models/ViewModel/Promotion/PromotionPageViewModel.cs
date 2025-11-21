using System.Collections.Generic;

namespace StoreManagement.Models.ViewModels
{
    public class PromotionPageViewModel
    {
        public List<PromotionViewModel>? Promotions { get; set; }

        public int CurrentPage { get; set; } = 1;
        public int TotalPages { get; set; } = 1;

        public string? SearchTerm { get; set; }
    }
}
