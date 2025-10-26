document.addEventListener("DOMContentLoaded", function () {
  const modalTitle = document.getElementById("userModalTitle");
  const saveBtn = document.getElementById("userModalSaveBtn");
  const passwordInput = document.getElementById("password");
  const passwordConfirmInput = document.getElementById("confirm");
  const inputs = document.querySelectorAll("#userForm input, #userForm select");

  // Reset modal mỗi lần mở
  const resetModal = () => {
    inputs.forEach(el => {
      el.value = "";
      el.removeAttribute("readonly");
      el.removeAttribute("disabled");
    });
    passwordInput.type = "password";
    passwordConfirmInput.type = "password";
    saveBtn.style.display = "inline-block";
  };

  // Thêm mới
  document.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", () => {
      resetModal();
      modalTitle.innerText = "Thêm người dùng mới";
      saveBtn.innerText = "Thêm";
    });
  });

  // Xem chi tiết
  document.querySelectorAll(".btn-view").forEach(btn => {
    btn.addEventListener("click", () => {
      resetModal();
      modalTitle.innerText = "Xem chi tiết người dùng";
      saveBtn.style.display = "none"; // ẩn nút Lưu
      inputs.forEach(el => el.setAttribute("readonly", true));
      document.getElementById("role").setAttribute("disabled", true);
    });
  });

  // Chỉnh sửa
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => {
      resetModal();
      modalTitle.innerText = "Chỉnh sửa người dùng";
      saveBtn.innerText = "Cập nhật";
      passwordInput.setAttribute("readonly", true); // password readonly
      passwordConfirmInput.setAttribute("readonly", true); // password readonly
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

