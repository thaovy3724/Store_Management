document.addEventListener("DOMContentLoaded", function () {
    const modalTitle = document.getElementById("promotionModalTitle");
    const saveBtn = document.getElementById("promotionModalSaveBtn");
    const inputs = document.querySelectorAll("#promotionForm input, #promotionForm select");


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
            modalTitle.innerText = "Thêm khuyến mãi mới";
            saveBtn.innerText = "Thêm";
        });
    });
    // Xem chi tiết
    document.querySelectorAll(".btn-view").forEach(btn => {
        btn.addEventListener("click", () => {
            resetModal();
            modalTitle.innerText = "Xem chi tiết khuyến mãi";
            saveBtn.style.display = "none";

            inputs.forEach(el => {
                if (el.tagName.toLowerCase() === "select") {
                    el.setAttribute("disabled", true);
                } else {
                    el.setAttribute("readonly", true);
                }
            });
        });
    });
    // Chỉnh sửa
    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", () => {
            resetModal();
            modalTitle.innerText = "Chỉnh sửa khuyến mãi";
            saveBtn.innerText = "Cập nhật";
        });
    });
});
// Khóa
document.querySelectorAll('.btn-lock').forEach(btn => {
    btn.addEventListener('click', () => {
        const icon = btn.querySelector('i');
        if (icon.classList.contains('bi-unlock')) {
            // Chuyển sang khóa
            icon.classList.remove('bi-unlock', 'text-primary');
            icon.classList.add('bi-lock', 'text-danger');
        } else {
            // Chuyển sang mở khóa
            icon.classList.remove('bi-lock', 'text-danger');
            icon.classList.add('bi-unlock', 'text-primary');
        }
    });
});


