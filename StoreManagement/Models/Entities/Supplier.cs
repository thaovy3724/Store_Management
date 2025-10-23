using System.ComponentModel.DataAnnotations;

namespace StoreManagement.Models.Entities;

public class Supplier
{
    public int Id { get; set; }
    
    [Required(ErrorMessage = "Tên không được để trống")]
    public string Name { get; set; }
    
    [Required(ErrorMessage = "Số điện thoại không được để trống")]
    public string Phone { get; set; }
    
    [Required(ErrorMessage = "Email không được để trống")]
    public string Email { get; set; }
    
    [Required(ErrorMessage = "Địa chỉ không được để trống")]
    public string Address { get; set; }

}