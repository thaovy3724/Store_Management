document.addEventListener("DOMContentLoaded", function () {
  const modalTitle = document.getElementById("orderHistoryModalTitle");
  const saveBtn = document.getElementById("orderHistoryModalSaveBtn");
  const inputs = document.querySelectorAll("#orderHistoryForm input, #orderHistoryForm select");

  // Reset modal mỗi lần mở
  const resetModal = () => {
    inputs.forEach(el => {
      el.value = "";
      el.removeAttribute("readonly");
      el.removeAttribute("disabled");
    });
  };

  // Xem chi tiết
  document.querySelectorAll(".btn-view").forEach(btn => {
    btn.addEventListener("click", () => {
      resetModal();
      modalTitle.innerText = "Xem chi tiết đơn hàng";
      saveBtn.style.display = "none"; // ẩn nút Lưu
      inputs.forEach(el => el.setAttribute("readonly", true));
      document.getElementById("role").setAttribute("disabled", true);
    });
  });
});


