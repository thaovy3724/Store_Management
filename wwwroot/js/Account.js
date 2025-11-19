document.addEventListener("DOMContentLoaded", function () {
    const modalTitle = document.getElementById("userModalTitle");
    const saveBtn = document.getElementById("userModalSaveBtn");
    const userForm = document.getElementById("userForm");

    const userId = document.getElementById("userId");
    const usernameInput = document.getElementById("username");
    const fullnameInput = document.getElementById("fullname");
    const roleInput = document.getElementById("role");
    const passwordInput = document.getElementById("password");
    const passwordConfirmInput = document.getElementById("confirm");

    const tableBody = document.getElementById("accountTableBody");
    const roleFilter = document.getElementById("roleFilter");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    const inputs = document.querySelectorAll("#userForm input, #userForm select");

    // Reset modal
    const resetModal = () => {
        userForm.reset();

        userId.value = "0";
        document.querySelectorAll('.form-text').forEach(e => {
            e.textContent = "";
        });
        // passwordInput.removeAttribute("disabled");
        // passwordConfirmInput.removeAttribute("disabled");
    };

    // Thêm mới
    document.querySelectorAll(".btn-add").forEach(btn => {
        btn.addEventListener("click", () => {
            resetModal();
            modalTitle.innerText = "Thêm người dùng mới";
            saveBtn.innerText = "Thêm";
        });
    });

    // Chỉnh sửa
    document.addEventListener("click", async function(e) {
        if (e.target.closest(".btn-edit")) {
            const id = e.target.closest(".btn-edit").getAttribute("data-id");

            try {
                const response = await fetch(`/Account/GetAccount/${id}`);
                const result = await response.json();

                if (result.success) {
                    resetModal();
                    modalTitle.innerText = "Chỉnh sửa người dùng";
                    saveBtn.innerText = "Cập nhật";

                    const account = result.data;
                    userId.value = account.userId;
                    fullnameInput.value = account.fullname;
                    usernameInput.value = account.username;
                    roleInput.value = account.role;
                } else {
                    showAlert(result.message, 'error');
                }
            } catch (error) {
                showAlert('Không thể tải dữ liệu', 'error');
            }
        }
    })
    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", (e) => {
            
            
        });
    });

    // Submit form
    userForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const id = userId.value;
        const fullname = fullnameInput.value;
        const username = usernameInput.value;
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;
        const role = roleInput.value;

        const action = id === "0" ? "create" : "edit";

        if (!formValidate(action, fullname, username, password, passwordConfirm, role)) {
            return;
        }

        const formData = new FormData();
        formData.append('fullname', fullname);
        formData.append('username', username);
        formData.append('password', password);
        formData.append('role', role);
        formData.append('__RequestVerificationToken',
            document.querySelector('input[name="__RequestVerificationToken"]').value);

        try {
            const url = id === "0" ? "/Account/Create" : `/Account/Edit/${id}`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Đóng modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
                modal.hide();

                // Hiển thị thông báo
                showAlert(result.message, 'success')

                await searchAndFilter();
            } else {
                showAlert(result.message, 'error')
            }
        } catch (error) {
            showAlert('Có lỗi xảy ra', 'error');
        }
    });

    document.addEventListener("click", function(e) {
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
                    const response = await fetch(`Account/Delete/${id}`, {
                        method: 'POST'
                    });
                    const result = await response.json();

                    if (result.success) {
                        showAlert(result.message, "success");
                        await searchAndFilter();
                    } else {
                        showAlert(result.message, "error");
                    }
                }
            });
        }
    });

    // Validate form
    const formValidate = (action, fullname, username, password, passwordConfirm, role) => {
        // Clear previous messages
        document.querySelectorAll(".form-text").forEach(message => {
            message.textContent = "";
        });

        inputs.forEach(element => {
            element.classList.remove("is-invalid");
        });

        const fullnameMsg = document.getElementById("fullname-msg");
        const usernameMsg = document.getElementById("username-msg");
        const passwordMsg = document.getElementById("password-msg");
        const passwordConfirmMsg = document.getElementById("password-confirm-msg");
        const roleMsg = document.getElementById("role-msg");


        let isValid = true;

        // Validate name
        if (fullname.trim() === "") {
            fullnameMsg.textContent = "Họ tên không để trống";
            fullnameInput.classList.add("is-invalid");
            isValid = false;
        } else if (fullname.length < 2) {
            fullnameMsg.textContent = "Họ tên không ít hơn 2 ký tự";
            fullnameInput.classList.add("is-invalid");
            isValid = false;
        } else if (fullname.length > 100) {
            fullnameMsg.textContent = "Họ tên không nhiều hơn 100 ký tự";
            fullnameInput.classList.add("is-invalid");
            isValid = false;
        }

        if (username.trim() === "") {
            usernameMsg.textContent = "Tên đăng nhập không để trống";
            usernameInput.classList.add("is-invalid");
            isValid = false;
        } else if (username.length < 2) {
            usernameMsg.textContent = "Tên đăng nhập không ít hơn 2 ký tự";
            usernameInput.classList.add("is-invalid");
            isValid = false;
        } else if (username.length > 50) {
            usernameMsg.textContent = "Tên đăng nhập không nhiều hơn 50 ký tự";
            usernameInput.classList.add("is-invalid");
            isValid = false;
        } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
            usernameMsg.textContent = "Tên đăng nhập chỉ được chứa chữ và số";
            usernameInput.classList.add("is-invalid");
            isValid = false;
        }

        let shouldValidatePassword = false;

        if (action === 'create') {
            // Tạo mới: Bắt buộc kiểm tra
            shouldValidatePassword = true;
        } else if (action === 'edit') {
            // Chỉnh sửa: Chỉ kiểm tra nếu người dùng nhập vào 1 trong 2 ô
            if (password.trim().length > 0 || passwordConfirm.trim().length > 0) {
                shouldValidatePassword = true;
            }
        }

        // Thực hiện kiểm tra nếu cần thiết
        if (shouldValidatePassword) {
            if (password.trim().length === 0) {
                passwordMsg.textContent = "Mật khẩu không được để trống!";
                passwordInput.classList.add("is-invalid");
                isValid = false;
            }

            if (passwordConfirm.trim().length === 0) {
                passwordConfirmMsg.textContent = "Mật khẩu xác nhận không được để trống!";
                passwordConfirmInput.classList.add("is-invalid");
                isValid = false;
            } else if (password.trim() !== passwordConfirm.trim()) {
                passwordConfirmMsg.textContent = "Mật khẩu xác nhận không chính xác!";
                passwordConfirmInput.classList.add("is-invalid");
                isValid = false;
            }
        }

        if (!role) {
            roleMsg.textContent = "Vui lòng chọn quyền cho tài khoản!";
            roleInput.classList.add("is-invalid");
            isValid = false;
        } else if (role.trim() != 'admin' && role.trim() != 'staff') {
            roleMsg.textContent = "Quyền không hợp lệ!";
            roleInput.classList.add("is-invalid");
            isValid = false;
        }

        return isValid;
    };

    // Load lại danh sách account
    const loadAccounts = async () => {
        const response = await fetch("Account/GetAccounts");
        const result = await response.json();
        const accounts = result.data;

        if (result.success) {
            renderTable(accounts);
        } else {
            showAlert("Có lỗi xảy ra lấy dữ liệu", "error");
        }
    }

    const renderTable = (accounts) => {
        tableBody.innerHTML = '';
        if (accounts.length === 0) {
            tableBody.innerHTML = `
                <tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>
            `;
        } else {
            accounts.forEach(account => {
                const roleBgColor = account.role === "Admin" ? "#0d6efd1a" : "#ffc1071a";
                const roleTxtColor = account.role === "Admin" ? "#0d6efd" : "#ffc107";
                const row = `
                <tr class="text-center">
                    <td class="text-center">${account.userId}</td>
                    <td>${account.username}</td>
                    <td>${account.fullname}</td>
                    <td>
                        <span 
                            class="badge rounded-pill px-3 py-2 fw-semibold"
                            style="background-color:${roleBgColor}; color:${roleTxtColor}; border:1px solid ${roleTxtColor};">
                            ${account.role}
                        </span>
                    </td>
                    <td class="text-center">
                        <button 
                            class="btn btn-sm btn-light border me-1 btn-edit" 
                            data-id=${account.userId}
                            title="Sửa" 
                            data-bs-toggle="modal" 
                            data-bs-target="#userModal">
                            <i class="bi bi-pencil text-success"></i>
                        </button>
                        <button 
                            class="btn btn-sm btn-light border btn-delete" 
                            title="Xóa"
                            data-id=${account.userId}
                            >
                            <i class="bi bi-trash text-danger"></i>
                        </button>
                    </td>
                </tr>
               `;
                tableBody.innerHTML += row;
            });
        }
    }
    
    // Search & Filter
    const searchAndFilter = async () => {
        const keyword = searchInput.value.trim();
        const role = roleFilter.value;
        
        const url = `/Account/SearchAndFilter?keyword=${encodeURIComponent(keyword)}&role=${encodeURIComponent(role)}`;

        try {
            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                renderTable(result.data);
            } else {
                showAlert("Có lỗi xảy ra lấy dữ liệu", "error");
            }
        } catch (error) {
            console.error(error);
            showAlert("Lỗi kết nối đến server", "error");
        }
    }

    // Sự kiện khi nhấn nút Search
    if (searchBtn) {
        searchBtn.addEventListener("click", async function() {
            await searchAndFilter();
        });
    }

    // Sự kiện khi nhấn Enter trong ô input tìm kiếm
    if (searchInput) {
        searchInput.addEventListener("keyup", async function(event) {
            if (event.key === "Enter") {
                await searchAndFilter();
            }
        });
    }

    // Sự kiện khi thay đổi Dropdown lọc quyền (Role)
    if (roleFilter) {
        roleFilter.addEventListener("change", async function() {
            await searchAndFilter();
        });
    }
});