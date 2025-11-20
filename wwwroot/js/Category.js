document.addEventListener("DOMContentLoaded", function () {
    const modalTitle = document.getElementById("categoryModalTitle");
    const saveBtn = document.getElementById("categoryModalSaveBtn");
    const categoryForm = document.getElementById("categoryForm");
    const categoryId = document.getElementById("categoryId");
    const typename = document.getElementById("typename");
    const tableBody = document.getElementById("categoryTableBody");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    // Reset modal
    const resetModal = () => {
        categoryId.value = "0";
        typename.value = "";
        typename.classList.remove("is-invalid");
        document.getElementById("typename-msg").textContent = "";
    };

    // Thêm mới
    document.querySelectorAll(".btn-add").forEach(btn => {
        btn.addEventListener("click", () => {
            resetModal();
            modalTitle.innerText = "Thêm loại sản phẩm mới";
            saveBtn.innerText = "Thêm";
        });
    });

    // Submit form
    categoryForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const id = categoryId.value;
        const name = typename.value.trim();

        if (!validateCategoryName(name)) {
            return;
        }

        const formData = new FormData();
        formData.append('categoryName', name);
        formData.append('__RequestVerificationToken',
            document.querySelector('input[name="__RequestVerificationToken"]').value);

        try {
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

                // Hiển thị thông báo
                showAlert(result.message, 'success')

                await loadCategories();
            } else {
                typename.classList.add("is-invalid");
                document.getElementById("typename-msg").textContent = result.message;
            }
        } catch (error) {
            showAlert('Có lỗi xảy ra', 'error');
        }
    });
    

    // Chỉnh sửa
    document.addEventListener("click", async function (e) {
        if (e.target.closest(".btn-edit")) {
            const id = e.target.closest(".btn-edit").getAttribute("data-id");

            try {
                const response = await fetch(`/Category/GetCategory/${id}`);
                const result = await response.json();

                if (result.success) {
                    resetModal();
                    categoryId.value = result.data.id;
                    typename.value = result.data.name;
                    modalTitle.innerText = "Chỉnh sửa loại sản phẩm";
                    saveBtn.innerText = "Cập nhật";
                } else {
                    showAlert(result.message, 'error');
                }
            } catch (error) {
                showAlert('Không thể tải dữ liệu', 'error');
            }
        }
    });
    
    // Validate dữ liệu
    function validateCategoryName(name) {
        let isValid = true;

        // Regex: chỉ cho phép chữ cái và khoảng trắng
        if (!name) {
            typename.classList.add("is-invalid");
            document.getElementById("typename-msg").textContent = "Tên loại không được để trống";
            isValid = false;
        }
        if (!/^[\p{L}\s]+$/u.test(name)) {
            typename.classList.add("is-invalid");
            document.getElementById("typename-msg").textContent = "Tên loại chỉ được chứa chữ cái và khoảng trắng";
            isValid = false;
        }

        return isValid;
    }
    
    // Render lại danh sách
    async function loadCategories() {
        const response = await fetch("Category/GetCategories");
        const result = await response.json();
        const categories = result.data;

        if (result.success) { 
            renderTable(categories);
        } else {
            showAlert("Có lỗi xảy ra lấy dữ liệu", "error");
        }
    }
    
    function renderTable(categories) {
        tableBody.innerHTML = "";
        if (categories.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" class="text-center">Không có dữ liệu</td></tr>`;
        } else {
            categories.forEach(category => {
                const row = `
                    <tr class="text-center" data-id="${category.categoryId}">
                        <td>LSP${category.categoryId}</td>
                        <td class="category-name">${category.categoryName}</td>
                        <td>
                            <button class="btn btn-sm btn-light border me-1 btn-edit"
                                    title="Sửa"
                                    data-bs-toggle="modal"
                                    data-bs-target="#categoryModal"
                                    data-id="${category.categoryId}">
                                <i class="bi bi-pencil text-success"></i>
                            </button>
                            <button class="btn btn-sm btn-light border btn-delete"
                                    title="Xóa"
                                    data-id="${category.categoryId}">
                                <i class="bi bi-trash text-danger"></i>
                            </button>
                        </td>
                    </tr>
                    `;
                tableBody.innerHTML += row;
            });
        }
    }

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
                            await loadCategories();
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
                renderTable(result.data);
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
});