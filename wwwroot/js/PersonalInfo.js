document.addEventListener("DOMContentLoaded", function () {
    const profileForm = document.getElementById("profileForm");
    const passwordForm = document.getElementById("passwordForm");
    const fullnameInput = document.getElementById("fullname");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const usernameInput = document.getElementById("username");

    //validation functions
    const validateFullName = (fullName) => {
        const trimmedName = fullName.trim();

        if (!trimmedName) {
            return { isValid: false, message: "Họ tên không được để trống!" };
        }

        if (trimmedName.length < 2) {
            return { isValid: false, message: "Họ tên phải có ít nhất 2 ký tự!" };
        }

        if (trimmedName.length > 100) {
            return { isValid: false, message: "Họ tên không được vượt quá 100 ký tự!" };
        }

        // Chỉ cho phép chữ cái và khoảng trắng
        if (!/^[\p{L}\s]+$/u.test(trimmedName)) {
            return { isValid: false, message: "Họ tên chỉ được chứa chữ cái và khoảng trắng!" };
        }

        // Không được có nhiều khoảng trắng liên tiếp
        if (/\s{2,}/.test(trimmedName)) {
            return { isValid: false, message: "Không được có nhiều khoảng trắng liên tiếp!" };
        }

        return { isValid: true, message: "" };
    };

    const validateUsername = (username) => {
        const trimmedUsername = username.trim();

        if (!trimmedUsername) {
            return { isValid: false, message: "Tên đăng nhập không được để trống!" };
        }

        if (trimmedUsername.length < 4) {
            return { isValid: false, message: "Tên đăng nhập phải có ít nhất 4 ký tự!" };
        }

        if (trimmedUsername.length > 50) {
            return { isValid: false, message: "Tên đăng nhập không được vượt quá 50 ký tự!" };
        }

        if (!/^[a-zA-Z0-9_ ]+$/.test(trimmedUsername)) {
            return { isValid: false, message: "Tên đăng nhập không được chứa kí tự đặc biệt!" };
        }

        return { isValid: true, message: "" };
    };


    // Cập nhật thông tin cá nhân
    profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const userId = document.getElementById("userId").value;
        const fullName = fullnameInput.value;
        const username = usernameInput.value;

        // Validate username
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
            showAlert(usernameValidation.message, "error");
            return;
        }

        // Validate fullname
        const fullnameValidation = validateFullName(fullName);
        if (!fullnameValidation.isValid) {
            showAlert(fullnameValidation.message, "error");
            return;
        }

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("username", username.trim());
        formData.append("fullName", fullName.trim());
        formData.append("__RequestVerificationToken",
            document.querySelector('input[name="__RequestVerificationToken"]').value);

        try {
            setLoadingState(profileForm, true);

            const response = await fetch('/PersonalInfo/UpdatePersonalInfo', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showAlert(data.message, "success");
            } else {
                showAlert(data.message, "error");
            }
        } catch (error) {
            showAlert('Có lỗi xảy ra khi cập nhật thông tin!', "error");
        } finally {
            setLoadingState(profileForm, false);
        }
    });
    
    // Validate password
    const validatePassword = (newPassword, confirmPassword) => {
        if (!newPassword || !confirmPassword) {
            return { isValid: false, message: "Vui lòng điền đầy đủ thông tin!" };
        }

        if (newPassword !== confirmPassword) {
            return { isValid: false, message: "Mật khẩu xác nhận không khớp!" };
        }

        if (newPassword.length < 6) {
            return { isValid: false, message: "Mật khẩu phải từ 6 ký tự trở lên!" };
        }

        if (newPassword.length > 255) {
            return { isValid: false, message: "Mật khẩu không được vượt quá 255 ký tự!" };
        }

        // Kiểm tra mật khẩu mạnh
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
            return { isValid: false, message: "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số!" };
        }

        return { isValid: true, message: "" };
    };

    // Update password
    passwordForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const userId = document.getElementById("userIdPwd").value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Client-side validation
        const validation = validatePassword(newPassword, confirmPassword);
        if (!validation.isValid) {
            showAlert(validation.message, "error");
            return;
        }

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("newPassword", newPassword);
        formData.append("__RequestVerificationToken",
            document.querySelector('input[name="__RequestVerificationToken"]').value);

        try {
            setLoadingState(passwordForm, true);

            const response = await fetch('/PersonalInfo/ChangePassword', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showAlert(data.message, "success");
                // Clear password fields
                newPasswordInput.value = "";
                confirmPasswordInput.value = "";
            } else {
                showAlert(data.message, "error");
            }
        } catch (error) {
            showAlert('Có lỗi xảy ra khi đổi mật khẩu!', "error");
            console.error('Change password error:', error);
        } finally {
            setLoadingState(passwordForm, false);
        }
    });

    // Bật tắt trạng thái loading cho form
    const setLoadingState = (form, isLoading) => {
        const submitBtn = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input');

        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
            inputs.forEach(input => input.disabled = true);
        } else {
            submitBtn.disabled = false;
            if (form === profileForm) {
                submitBtn.innerHTML = '<i class="bi bi-save me-1"></i> Cập nhật';
            } else {
                submitBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Lưu thay đổi';
            }
            inputs.forEach(input => {
                if (input.type !== 'hidden' && !input.hasAttribute('readonly')) {
                    input.disabled = false;
                }
            });
        }
    };
});