const imagePreview = document.getElementById('image-preview');
const productImage = document.getElementById('product-image');
const uploadBtn = document.getElementById('upload-btn');

// Khi click vào khung hoặc nút upload => mở file selector
imagePreview.addEventListener('click', () => productImage.click());
uploadBtn.addEventListener('click', () => productImage.click());

// Hiển thị preview ảnh khi chọn file
productImage.addEventListener('change', function() {
  const file = this.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = function(e){
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width:100%; max-height:100%;">`;
    }
    reader.readAsDataURL(file);
  } else {
    imagePreview.innerHTML = '<span>Click để tải ảnh</span>';
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const modalTitle = document.getElementById("productModalTitle");
  const saveBtn = document.getElementById("productModalSaveBtn");
  const inputs = document.querySelectorAll("#productForm input, #productForm select");
  const uploadBtn = document.getElementById("upload-btn");
  const imagePreview = document.getElementById("image-preview");

  // Reset modal mỗi lần mở
  const resetModal = () => {
    inputs.forEach(el => {
      el.value = "";
      el.removeAttribute("readonly"); 
      el.removeAttribute("disabled");
    });
    uploadBtn.style.display = "inline-block";
    imagePreview.style.pointerEvents = "auto";
    imagePreview.style.opacity = "1";
    saveBtn.style.display = "inline-block";
    
  };

  // Thêm mới
  document.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", () => {
      resetModal();
      modalTitle.innerText = "Thêm sản phẩm mới";
      saveBtn.innerText = "Thêm";
    });
  });

  // Xem chi tiết
  document.querySelectorAll(".btn-view").forEach(btn => {
    btn.addEventListener("click", () => {
      resetModal();
      modalTitle.innerText = "Xem chi tiết sản phẩm";
      saveBtn.style.display = "none"; 
      inputs.forEach(el => {
        if(el.tagName.toLowerCase() === "select"){
          el.setAttribute("disabled", true); 
        } else {
          el.setAttribute("readonly", true);
        }
      });
      uploadBtn.style.display = "none";
      imagePreview.style.pointerEvents = "none";
      imagePreview.style.opacity = "0.6"; 
    });
  });


  // Chỉnh sửa
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => {
      resetModal();
      modalTitle.innerText = "Chỉnh sửa sản phẩm";
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

