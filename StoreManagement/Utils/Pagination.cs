namespace StoreManagement.Utils
{
    public class Pagination<T>
    {
        public List<T> Items { get; set; }          // Danh sách dữ liệu sau khi phân trang
        public int CurrentPage { get; set; }        // Trang hiện tại
        public int PageSize { get; set; }           // Số phần tử mỗi trang
        public int TotalItems { get; set; }         // Tổng số phần tử
        public int TotalPages { get; set; }         // Tổng số trang

        public Pagination(List<T> items, int totalItems, int currentPage, int pageSize)
        {
            Items = items;
            TotalItems = totalItems;
            CurrentPage = currentPage;
            PageSize = pageSize;
            TotalPages = (int)Math.Ceiling((double)totalItems / pageSize);
        }

        // ✅ Dùng LINQ để phân trang 1 list
        public static Pagination<T> Create(IEnumerable<T> source, int page, int pageSize)
        {
            var total = source.Count();
            var items = source.Skip((page - 1) * pageSize).Take(pageSize).ToList();
            return new Pagination<T>(items, total, page, pageSize);
        }
    }
}
