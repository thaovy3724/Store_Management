$(document).ready(function () {
    const modalTitle = $("#promotionModalTitle");
    const saveBtn = $("#promotionModalSaveBtn");
    const form = $("#promotionForm");
    const tableBody = $("#promotionTableBody"); // Thay "table tbody" bằng id
    const pagination = $("#pagination"); // Id cho ul pagination
    let editingId = null;

    // Biến lưu filters và page
    let currentPage = 1;
    let pageSize = 10;
    let search = '';
    let status = '';
    let fromDate = '';
    let toDate = '';

    // --- 1. Load danh sách với filter và pagination ---
    function loadPromotions() {
        const params = {
            search: search,
            status: status,
            fromDate: fromDate,
            toDate: toDate,
            page: currentPage,
            pageSize: pageSize
        };

        $.get("/Promotion/GetAll", params, function (res) {
            tableBody.empty();
            if (res.items.length === 0) {
                tableBody.append('<tr><td colspan="7" class="text-center text-muted">Không có mã giảm giá</td></tr>');
            } else {
                res.items.forEach(p => {
                    console.log("Promotion item:", p);
                    const row = `
                        <tr class="text-center" data-id="${p.id}">
                            <td>${p.code}</td>
                            <td>${p.minOrderAmount.toLocaleString()} đ</td>
                            <td>${p.usageLimit}</td>
                            <td>${formatDate(p.startDate)}</td>
                            <td>${formatDate(p.endDate)}</td>
                            <td>${p.status}</td>
                            <td>
                                <button class="btn btn-sm btn-light border me-1 btn-view" title="Xem"><i class="bi bi-eye text-primary"></i></button>
                                <button class="btn btn-sm btn-light border me-1 btn-edit" title="Sửa"><i class="bi bi-pencil text-success"></i></button>
                                <button class="btn btn-sm btn-light border btn-delete" title="Xóa"><i class="bi bi-trash text-danger"></i></button>
                            </td>
                        </tr>`;
                    tableBody.append(row);
                });
            }

            // Build pagination
            buildPagination(res.totalCount);
        });
    }
    loadPromotions(); // Load lần đầu

    // --- Thanh phân trang ---
    function buildPagination(totalCount) {
        pagination.empty();
        const totalPages = Math.ceil(totalCount / pageSize);
        if (totalPages <= 1) return;

        // Prev
        pagination.append(`
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">&laquo;</a>
            </li>
        `);

        // Pages
        for (let i = 1; i <= totalPages; i++) {
            pagination.append(`
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
        }

        // Next
        pagination.append(`
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">&raquo;</a>
            </li>
        `);
    }

    // Event click page
    $(document).on("click", "#pagination a", function (e) {
        e.preventDefault();
        const page = $(this).data("page");
        if (page && page > 0) {
            currentPage = page;
            loadPromotions();
        }
    });


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
    function resetModal() {
        form[0].reset();
        editingId = null;
        saveBtn.text("Lưu").show();
        form.find("input, select").prop("readonly", false).prop("disabled", false);

        // ẨN TẤT CẢ WARNING
        form.find(".form-text.text-danger").hide();
    }
    function validateForm() {
        let isValid = true;
        form.find(".form-text.text-danger").hide(); // Ẩn tất cả trước

        const code = $("#code").val()?.trim().toUpperCase();
        const type = $("#discountType").val();
        const value = parseFloat($("#discountValue").val()) || 0;
        const minOrder = parseFloat($("#minOrderAmount").val()) || 0;
        const usageLimit = parseInt($("#usageLimit").val()) || 0;
        const startDate = $("#startDate").val();
        const endDate = $("#endDate").val();

        // 1. Mã
        let codeRegex = /^[A-Za-z0-9]+$/;
        if (!code) {
            $("#code-msg").show();
            isValid = false;
        } else if (!codeRegex.test(code)) {
            $("#code-msg").text("Chỉ bao gồm chữ và số").show();
            isValid = false;
        }

        // 2. Loại
        if (!type) {
            $("#discountType-msg").show();
            isValid = false;
        }

        // 3. Giá trị
        if (value <= 0) {
            $("#discountValue-msg").text("Giá trị phải lớn hơn 0").show();
            isValid = false;
        } else if (type === "percent" && value > 100) {
            $("#discountValue-msg").text("Phần trăm không được vượt quá 100").show();
            isValid = false;
        } else {
            $("#discountValue-msg").hide();
        }

        // 4. Đơn tối thiểu
        if (minOrder < 0) {
            $("#minOrderAmount-msg").text("Không được âm").show();
            isValid = false;
        }

        // 5. Giới hạn sử dụng
        if (usageLimit < 0) {
            $("#usageLimit-msg").text("Không được âm").show();
            isValid = false;
        }

        // 6. Ngày bắt đầu
        if (!startDate) {
            $("#startDate-msg").show();
            isValid = false;
        }

        // 7. Ngày kết thúc
        if (!endDate) {
            $("#endDate-msg").show();
            isValid = false;
        } else if (startDate && endDate < startDate) {
            $("#endDate-msg").text("Ngày kết thúc phải sau ngày bắt đầu").show();
            isValid = false;
        }

        return isValid;
    }

    // --- 4. Lưu (Thêm hoặc Cập nhật) ---
    form.submit(function (e) {
        e.preventDefault();
        if (!validateForm()) return;
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
        $("#code").val(p.code);
        $("#discountType").val(p.type);
        $("#discountValue").val(p.value);
        $("#minOrderAmount").val(p.minOrderAmount);
        $("#usageLimit").val(p.usageLimit);
        $("#startDate").val(formatDate(p.startDate));
        $("#endDate").val(formatDate(p.endDate));

        // Ẩn tất cả warning khi sửa
        form.find(".form-text.text-danger").hide();
        form.find("input, select").prop("readonly", readonly).prop("disabled", readonly);
        if (readonly) {
            $("#isLocked").prop("disabled", true);
            saveBtn.hide(); // Ẩn nút khi xem
        } else {
            saveBtn.show(); // Luôn hiện khi sửa
        }
    }
    function formatDate(dateStr) {
        if (!dateStr) return '';
        return dateStr.split('T')[0]; // "2025-11-01T00:00:00" → "2025-11-01"
    }

    // --- 9. Lọc & tìm kiếm ---
    // Lọc theo trạng thái
    $("#filterStatus").change(function () {
        status = $(this).val();
        currentPage = 1;
        loadPromotions();
    });

    // Lọc từ ngày
    $("#fromDate").change(function () {
        fromDate = $(this).val();
        currentPage = 1;
        loadPromotions();
    });

    // Lọc đến ngày
    $("#toDate").change(function () {
        toDate = $(this).val();
        currentPage = 1;
        loadPromotions();
    });

    // Tìm kiếm mã
    $("#btnSearch").click(function () {
        search = $("#searchCode").val()?.trim();
        currentPage = 1;
        loadPromotions();
    });

    // Reset filter
    $("#btnResetFilter").click(function () {
        // Reset các biến filter
        search = '';
        status = '';
        fromDate = '';
        toDate = '';
        currentPage = 1;

        // Reset UI (xóa giá trị input/select)
        $("#searchCode").val('');
        $("#filterStatus").val('');
        $("#fromDate").val('');
        $("#toDate").val('');

        // Load lại danh sách đầy đủ
        loadPromotions();
    });
});
