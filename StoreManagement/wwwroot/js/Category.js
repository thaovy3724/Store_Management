document.addEventListener("DOMContentLoaded", function () {
    const modalTitle = document.getElementById("categoryModalTitle");
    const saveBtn = document.getElementById("categoryModalSaveBtn");
    const categoryForm = document.getElementById("categoryForm");
    const categoryId = document.getElementById("categoryId");
    const typename = document.getElementById("typename");
    const tableBody = document.getElementById("categoryTableBody");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    //Validation function
    const validateCategoryName = (name) => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return { isValid: false, message: "Tên loại không được để trống" };
        }

        if (trimmedName.length < 2) {
            return { isValid: false, message: "Tên loại phải có ít nhất 2 ký tự" };
        }

        if (trimmedName.length > 100) {
            return { isValid: false, message: "Tên loại không được vượt quá 30 ký tự" };
        }

        if (!/^[\p{L}\s]+$/u.test(trimmedName)) {
            return { isValid: false, message: "Tên loại chỉ được chứa chữ cái và khoảng trắng" };
        }

        if (/\s{2,}/.test(trimmedName)) {
            return { isValid: false, message: "Không được có nhiều khoảng trắng liên tiếp" };
        }

        if (trimmedName !== name.trim()) {
            return { isValid: false, message: "Tên loại không được có khoảng trắng ở đầu/cuối" };
        }

        return { isValid: true, message: "" };
    };

    const showValidationError = (message) => {
        typename.classList.add("is-invalid");
        document.getElementById("typename-msg").textContent = message;
    };

    const clearValidationError = () => {
        typename.classList.remove("is-invalid");
        document.getElementById("typename-msg").textContent = "";
    };

    // Reset modal
    const resetModal = () => {
        categoryId.value = "0";
        typename.value = "";
        clearValidationError();
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
    document.addEventListener("click", async function (e) {
        if (e.target.closest(".btn-edit")) {
            const id = e.target.closest(".btn-edit").getAttribute("data-id");

            try {
                const response = await fetch(`/Category/GetCategory/${id}`);
                const result = await response.json();

                if (result.success) {
                    categoryId.value = result.data.id;
                    typename.value = result.data.name;
                    modalTitle.innerText = "Chỉnh sửa loại sản phẩm";
                    saveBtn.innerText = "Cập nhật";
                    clearValidationError();
                } else {
                    showAlert(result.message, "error");
                }
            } catch (error) {
                showAlert('Không thể tải dữ liệu', "error");
            }
        }
    });

    // Validation real-time
    typename.addEventListener('input', () => {
        clearValidationError();
    });

    // Submit form
    categoryForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const id = categoryId.value;
        const name = typename.value;

        // Client-side validation
        const validation = validateCategoryName(name);
        if (!validation.isValid) {
            showValidationError(validation.message);
            return;
        }

        const formData = new FormData();
        formData.append('categoryName', name.trim());
        formData.append('__RequestVerificationToken',
            document.querySelector('input[name="__RequestVerificationToken"]').value);

        try {
            saveBtn.disabled = true;
            const originalText = saveBtn.innerText;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';

            const url = id === "0" ? "/Category/Create" : `/Category/Edit/${id}`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Đóng modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
                modal.hide();

                // Hiển thị thông báo thành công
                showAlert(result.message, "success");

                // Cập nhật bảng
                if (id === "0") {
                    // Thêm mới - reload trang
                    setTimeout(() => location.reload(), 1500);
                } else {
                    // Cập nhật - sửa dòng hiện tại
                    const row = document.querySelector(`tr[data-id="${id}"]`);
                    if (row) {
                        row.querySelector('.category-name').textContent = result.data.name;
                    }
                }
            } else {
                // Hiển thị lỗi từ server (như trùng tên)
                showValidationError(result.message);
            }
        } catch (error) {
            showAlert('Có lỗi xảy ra khi gửi dữ liệu', "error");
            console.error('Submit error:', error);
        } finally {
            // Reset nút submit
            saveBtn.disabled = false;
            saveBtn.innerText = id === "0" ? "Thêm" : "Cập nhật";
        }
    });

    // Xóa
    document.addEventListener("click", function (e) {
        if (e.target.closest(".btn-delete")) {
            const id = e.target.closest(".btn-delete").getAttribute("data-id");

            Swal.fire({
                title: 'Bạn có chắc muốn xóa?',
                text: "Hành động này sẽ không thể hoàn tác!",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const formData = new FormData();
                        formData.append('__RequestVerificationToken',
                            document.querySelector('input[name="__RequestVerificationToken"]').value);

                        const response = await fetch(`/Category/Delete/${id}`, {
                            method: 'POST',
                            body: formData
                        });

                        const data = await response.json();

                        if (data.success) {
                            showAlert(data.message, "success");
                            performSearch();
                        } else {
                            showAlert(data.message, "error");
                        }
                    } catch (error) {
                        showAlert(error, "error");
                    }
                }
            });
        }
    });

    // Tìm kiếm
    const performSearch = async () => {
        const searchTerm = searchInput.value.trim();
        try {
            const response = await fetch(`/Category/Search?searchTerm=${encodeURIComponent(searchTerm)}`);
            const result = await response.json();

            if (result.success) {
                updateTable(result.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            performSearch();
        }
    });

    // Cập nhật bảng
    const updateTable = (categories) => {
        tableBody.innerHTML = "";
        if (categories && categories.length > 0) {
            categories.forEach(item => {
                const row = `
                    <tr class="text-center" data-id="${item.categoryId}">
                        <td>LSP${item.categoryId}</td>
                        <td class="category-name">${escapeHtml(item.categoryName)}</td>
                        <td>
                            <button class="btn btn-sm btn-light border me-1 btn-edit"
                                    title="Sửa"
                                    data-bs-toggle="modal"
                                    data-bs-target="#categoryModal"
                                    data-id="${item.categoryId}">
                                <i class="bi bi-pencil text-success"></i>
                            </button>
                            <button class="btn btn-sm btn-light border btn-delete"
                                    title="Xóa"
                                    data-id="${item.categoryId}">
                                <i class="bi bi-trash text-danger"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="3" class="text-center">Không tìm thấy dữ liệu</td></tr>';
        }
    };

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
});

