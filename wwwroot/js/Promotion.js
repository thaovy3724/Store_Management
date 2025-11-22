document.addEventListener("DOMContentLoaded", function () {

    const modalTitle = document.getElementById("promotionModalTitle");
    const saveBtn = document.getElementById("promotionModalSaveBtn");
    const inputs = document.querySelectorAll("#promotionForm input, #promotionForm select, #promotionForm textarea");

    // RESET MODAL
    const resetModal = () => {
        inputs.forEach(el => {
            if (el.tagName === "SELECT") {
                el.value = "-1";
            } else {
                el.value = "";
            }

            el.removeAttribute("readonly");
            el.removeAttribute("disabled");
        });

        saveBtn.style.display = "inline-block";
    };


    // EVENT CLICK CHUNG
    document.addEventListener("click", async function (e) {
        const target = e.target.closest("[data-action]");
        if (!target) return;

        const action = target.getAttribute("data-action");

        switch (action) {

            case "view_add":
                resetModal();
                modalTitle.innerText = "Thêm mã khuyến mãi";
                saveBtn.innerText = "Thêm";
                saveBtn.setAttribute("data-action", "add");
                break;

            case "view":
                resetModal();
                const viewId = target.getAttribute("data-id");
                await showDetail(viewId);

                modalTitle.innerText = "Xem chi tiết khuyến mãi";
                saveBtn.style.display = "none";

                inputs.forEach(el => {
                    el.setAttribute("readonly", true);
                    el.setAttribute("disabled", true);
                });
                break;

            case "view_edit":
                resetModal();
                const editId = target.getAttribute("data-id");
                await showDetail(editId);

                modalTitle.innerText = "Chỉnh sửa khuyến mãi";
                saveBtn.innerText = "Cập nhật";
                saveBtn.setAttribute("data-action", "update");
                saveBtn.dataset.id = editId; 
                break;

            case "add":
                await addPromotion();
                break;

            case "update":
                var id = target.getAttribute("data-id")
                await updatePromotion(id);
                break;

            case "delete":
                var id = target.getAttribute("data-id");
                await deletePromotion(id);
                break;
        }
    });


    function validateForm(formData, action) {

        const fields = {
            code: formData.get("PromoCode"),
            discountType: formData.get("DiscountType"),
            discountValue: formData.get("DiscountValue"),
            minOrderAmount: formData.get("MinOrderAmount"),
            usageLimit: formData.get("UsageLimit"),
            startDate: formData.get("StartDate"),
            endDate: formData.get("EndDate"),
        };

        const errors = {
            code: document.getElementById("promotion-PromoCode-error"),
            discountType: document.getElementById("promotion-DiscountType-error"),
            discountValue: document.getElementById("promotion-DiscountValue-error"),
            minOrderAmount: document.getElementById("promotion-MinOrderAmount-error"),
            usageLimit: document.getElementById("promotion-UsageLimit-error"),
            startDate: document.getElementById("promotion-StartDate-error"),
            endDate: document.getElementById("promotion-EndDate-error"),
        };

        // Xóa tất cả lỗi cũ
        Object.values(errors).forEach(e => {
            e.classList.add("d-none");
            e.innerText = "";
        });

        let isValid = true;

        // --- VALIDATION RULES ---

        // Mã KM
        if (!fields.code) {
            errors.code.classList.remove("d-none");
            errors.code.innerText = "Vui lòng nhập mã khuyến mãi";
            isValid = false;
        }

        // Loại khuyến mãi
        if (!fields.discountType) {
            errors.discountType.classList.remove("d-none");
            errors.discountType.innerText = "Vui lòng chọn loại khuyến mãi";
            isValid = false;
        }

        // Giá trị KM
        if (isNaN(fields.discountValue) || fields.discountValue <= 0) {
            errors.discountValue.classList.remove("d-none");
            errors.discountValue.innerText = "Giá trị khuyến mãi không hợp lệ";
            isValid = false;
        }

        // Giá trị đơn hàng tối thiểu
        if (isNaN(fields.minOrderAmount) || fields.minOrderAmount < 0) {
            errors.minOrderAmount.classList.remove("d-none");
            errors.minOrderAmount.innerText = "Giá trị đơn hàng tối thiểu không hợp lệ";
            isValid = false;
        }

        // Giới hạn số lần sử dụng
        if (isNaN(fields.usageLimit) || fields.usageLimit < 0) {
            errors.usageLimit.classList.remove("d-none");
            errors.usageLimit.innerText = "Giới hạn lần sử dụng phải ≥ 0";
            isValid = false;
        }

        // Ngày bắt đầu
        if (!fields.startDate) {
            errors.startDate.classList.remove("d-none");
            errors.startDate.innerText = "Vui lòng chọn ngày bắt đầu";
            isValid = false;
        }

        // Ngày kết thúc
        if (!fields.endDate) {
            errors.endDate.classList.remove("d-none");
            errors.endDate.innerText = "Vui lòng chọn ngày kết thúc";
            isValid = false;
        }

        // start > end
        if (fields.startDate && fields.endDate && fields.startDate > fields.endDate) {
            errors.endDate.classList.remove("d-none");
            errors.endDate.innerText = "Ngày kết thúc phải sau ngày bắt đầu";
            isValid = false;
        }

        return isValid;
    }

    async function addPromotion() {
        const formData = new FormData(document.getElementById("promotionForm"));

        if (!validateForm(formData, "add")) return;

        const res = await fetch("/Promotion/Add", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        if (data.success) {
            showAlert(data.message, "success");
            await new Promise(r => setTimeout(r, 1500));
            window.location.reload();
        } else {
            showAlert(data.message, "error");
        }
    }

    async function updatePromotion(id) {
        console.log(id);
        const formData = new FormData(document.getElementById("promotionForm"));

        if (!validateForm(formData, "update")) return;

        const res = await fetch(`/Promotion/Update?promoId=${id}`, {
            method: "PUT",
            body: formData
        });

        const data = await res.json();
        if (data.success) {
            showAlert(data.message, "success");
            await new Promise(r => setTimeout(r, 1500));
            window.location.reload();
        } else {
            showAlert(data.message, "error");
        }
    }

    // DETAIL
    async function showDetail(id) {
        try {
            const res = await fetch(`/Promotion/Detail?promoId=${id}`);
            const data = await res.json();

            if (!data.success) {
                showAlert(data.message, "error");
                return;
            }

            const p = data.viewModel;

            document.querySelector('[name="PromoCode"]').value = p.promoCode;
            document.querySelector('[name="DiscountType"]').value = p.discountType;
            document.querySelector('[name="DiscountValue"]').value = p.discountValue;
            document.querySelector('[name="MinOrderAmount"]').value = p.minOrderAmount;
            document.querySelector('[name="UsageLimit"]').value = p.usageLimit;
            document.querySelector('[name="StartDate"]').value = p.startDate.split("T")[0];
            document.querySelector('[name="EndDate"]').value = p.endDate.split("T")[0];
            document.querySelector('[name="DiscountType"]').value = p.status;
            document.querySelector('[name="Description"]').value = p.description;

        } catch (e) {
            console.log(e);
            showAlert("Lỗi khi lấy dữ liệu.", "error");
        }
    }


    // DELETE
    async function deletePromotion(id) {
        //const confirm = await Swal.fire({
        //    title: "Xóa mã khuyến mãi?",
        //    text: "Hành động này không thể hoàn tác!",
        //    icon: "warning",
        //    showCancelButton: true,
        //    confirmButtonColor: "#d33",
        //    cancelButtonColor: "#999",
        //    confirmButtonText: "Xóa",
        //    cancelButtonText: "Hủy"
        //});

        //if (!confirm.isConfirmed) return;
        try {
            const res = await fetch(`/Promotion/Delete?promoId=${id}`, {
                method: "POST"
            });

            const data = await res.json();

            if (data.success) {
                showAlert(data.message, "success");
                document.querySelector(`#promo-${id}`)?.remove();
                await new Promise(r => setTimeout(r, 1000));
                window.location.reload();
            } else {
                showAlert(data.message, "error");
            }

        } catch (e) {
            showAlert("Có lỗi xảy ra.", "error");
        }
    }


    // FILTER (Tìm kiếm + trạng thái + ngày)
    function applyFilter() {
        const search = document.getElementById("searchInput").value.trim();
        const status = document.getElementById("filterStatus").value;
        const fromDate = document.getElementById("filterFromDate").value;
        const toDate = document.getElementById("filterToDate").value;

        const params = new URLSearchParams({
            page: 1,
            search: search || "",
            status: status !== "-1" ? status : "",
            fromDate: fromDate || "",
            toDate: toDate || ""
        });

        window.location.href = `/Promotion/Index?${params.toString()}`;
    }

    document.getElementById("btnSearch").addEventListener("click", applyFilter);

    ["filterStatus", "filterFromDate", "filterToDate"].forEach(id => {
        document.getElementById(id).addEventListener("change", applyFilter);
    });
    document.getElementById("searchInput").addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            applyFilter();
        }
    });
});

