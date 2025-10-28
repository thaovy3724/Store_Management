$(document).ready(function () {
    const modalTitle = $("#promotionModalTitle");
    const saveBtn = $("#promotionModalSaveBtn");
    const form = $("#promotionForm");
    const tableBody = $("table tbody");
    let editingId = null;

    // --- 1. Load danh sách ---
    function loadPromotions() {
        $.get("/Promotion/GetAll", function (data) {
            tableBody.empty();
            data.forEach(p => {
                const row = `
                    <tr class="text-center" data-id="${p.Id}">
                        <td>${p.Code}</td>
                        <td>${p.MinOrderAmount.toLocaleString()} đ</td>
                        <td>${p.UsageLimit}</td>
                        <td>${p.StartDate.split('T')[0]}</td>
                        <td>${p.EndDate.split('T')[0]}</td>
                        <td>
                            <button class="btn btn-sm btn-light border me-1 btn-view" title="Xem"><i class="bi bi-eye text-primary"></i></button>
                            <button class="btn btn-sm btn-light border me-1 btn-edit" title="Sửa"><i class="bi bi-pencil text-success"></i></button>
                            <button class="btn btn-sm btn-light border btn-delete" title="Xóa"><i class="bi bi-trash text-danger"></i></button>
                        </td>
                    </tr>`;
                tableBody.append(row);
            });
        });
    }
    loadPromotions();

    // --- 2. Reset modal ---
    function resetModal() {
        form[0].reset();
        editingId = null;
        saveBtn.text("Lưu").show();
        form.find("input, select").prop("readonly", false).prop("disabled", false);
    }

    // --- 3. Thêm mới ---
    $(".btn-add").click(function () {
        resetModal();
        modalTitle.text("Thêm khuyến mãi mới");
        $("#promotionModal").modal("show");
    });

    // --- 4. Lưu (Thêm hoặc Cập nhật) ---
    form.submit(function (e) {
        e.preventDefault();
        const payload = {
            Code: $("#code").val()?.trim().toUpperCase(),
            Type: $("#discountType").val(),
            Value: parseFloat($("#discountValue").val()),
            MinOrderAmount: parseFloat($("#minOrderAmount").val()),
            UsageLimit: parseInt($("#usageLimit").val()),
            StartDate: $("#startDate").val(),
            EndDate: $("#endDate").val()
        };

        const url = editingId ? `/Promotion/Update/${editingId}` : "/Promotion/Create";

        $.ajax({
            url: url,
            method: "POST",
            data: payload,
            success: function (res) {
                if (res.success) {
                    Swal.fire("Thành công", res.message, "success");
                    $("#promotionModal").modal("hide");
                    loadPromotions();
                } else {
                    Swal.fire("Lỗi", res.message, "error");
                }
            },
            error: () => Swal.fire("Lỗi", "Không thể kết nối máy chủ.", "error")
        });
    });

    // --- 5. Xem ---
    $(document).on("click", ".btn-view", function () {
        const id = $(this).closest("tr").data("id");
        $.get(`/Promotion/Get/${id}`, function (res) {
            if (!res.success) return Swal.fire("Lỗi", res.message, "error");
            const p = res.data;
            modalTitle.text("Xem chi tiết khuyến mãi");
            saveBtn.hide();
            fillForm(p, true);
            $("#promotionModal").modal("show");
        });
    });

    // --- 6. Sửa ---
    $(document).on("click", ".btn-edit", function () {
        const id = $(this).closest("tr").data("id");
        $.get(`/Promotion/Get/${id}`, function (res) {
            if (!res.success) return Swal.fire("Lỗi", res.message, "error");
            const p = res.data;
            editingId = id;
            modalTitle.text("Chỉnh sửa khuyến mãi");
            saveBtn.text("Cập nhật");
            fillForm(p, false);
            $("#promotionModal").modal("show");
        });
    });

    // --- 7. Xóa ---
    $(document).on("click", ".btn-delete", function () {
        const id = $(this).closest("tr").data("id");
        Swal.fire({
            title: "Xác nhận xóa?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa"
        }).then(result => {
            if (result.isConfirmed) {
                $.post(`/Promotion/Delete/${id}`, function (res) {
                    if (res.success) {
                        Swal.fire("Đã xóa", res.message, "success");
                        loadPromotions();
                    } else {
                        Swal.fire("Lỗi", res.message, "error");
                    }
                });
            }
        });
    });

    // --- 8. Hàm fill form ---
    function fillForm(p, readonly) {
        $("#discountType").val(p.Type);
        $("#discountValue").val(p.Value);
        $("#minOrderAmount").val(p.MinOrderAmount);
        $("#usageLimit").val(p.UsageLimit);
        $("#startDate").val(p.StartDate.split('T')[0]);
        $("#endDate").val(p.EndDate.split('T')[0]);
        form.find("input, select").prop("readonly", readonly).prop("disabled", readonly);
    }
});
