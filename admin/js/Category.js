document.addEventListener("DOMContentLoaded", function () {
  const modalTitle = document.getElementById("categoryModalTitle");
  const saveBtn = document.getElementById("categoryModalSaveBtn");
  const inputs = document.querySelectorAll("#categoryForm input, #categoryForm select");

  // Reset modal mỗi lần mở
  const resetModal = () => {
    inputs.forEach(el => {
      el.value = "";
      el.removeAttribute("readonly"); 
      el.removeAttribute("disabled"); 
    });
    saveBtn.style.display = "inline-block";
  };

  // Thêm mới
  document.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", () => {
      resetModal();
      modalTitle.innerText = "Thêm loại sản phẩm mới";
      saveBtn.innerText = "Thêm";
    });
  });

  // Chỉnh sửa
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => {
      resetModal();
      modalTitle.innerText = "Chỉnh sửa loại sản phẩm";
      saveBtn.innerText = "Cập nhật";
    });
  });
});
// Nút xóa
document.addEventListener("click", function(e) {
  if (e.target.closest(".btn-delete")) {
    Swal.fire({
      title: 'Bạn có chắc muốn xóa?',
      text: "Hành động này sẽ không thể hoàn tác!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: gọi API xóa hoặc xóa dòng trong bảng
        e.target.closest("tr")?.remove(); // ví dụ xóa dòng trong bảng

        Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: 'Dữ liệu đã được xóa thành công.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }
});

