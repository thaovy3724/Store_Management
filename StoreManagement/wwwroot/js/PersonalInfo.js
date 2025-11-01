document.addEventListener("DOMContentLoaded", function () {
    const profileForm = document.getElementById("profileForm");
    const passwordForm = document.getElementById("passwordForm");
    const fullnameInput = document.getElementById("fullname");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

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

    const validatePassword = (newPassword, confirmPassword) => {
        if (!newPassword || !confirmPassword) {
            return { isValid: false, message: "Mật khẩu không được để trống!" };
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

    // Cập nhật thông tin cá nhân
    profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const userId = document.getElementById("userId").value;
        const fullName = fullnameInput.value;

        // Client-side validation
        const validation = validateFullName(fullName);
        if (!validation.isValid) {
            showError('Lỗi!', validation.message);
            return;
        }

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("fullName", fullName.trim());
        formData.append("__RequestVerificationToken",
            document.querySelector('input[name="__RequestVerificationToken"]').value);

        try {
            setLoadingState(profileForm, true);

            const response = await fetch('/PersonalInfo/UpdateFullName', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Thành công!', data.message);
            } else {
                showError('Lỗi!', data.message);
            }
        } catch (error) {
            showError('Lỗi!', 'Có lỗi xảy ra khi cập nhật thông tin!');
            console.error('Update profile error:', error);
        } finally {
            setLoadingState(profileForm, false);
        }
    });

    // Đổi mật khẩu
    passwordForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const userId = document.getElementById("userIdPwd").value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Client-side validation
        const validation = validatePassword(newPassword, confirmPassword);
        if (!validation.isValid) {
            showError('Lỗi!', validation.message);
            return;
        }

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("newPassword", newPassword);
        formData.append("confirmPassword", confirmPassword);
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
                showSuccess('Thành công!', data.message);
                // Clear password fields
                newPasswordInput.value = "";
                confirmPasswordInput.value = "";
            } else {
                showError('Lỗi!', data.message);
            }
        } catch (error) {
            showError('Lỗi!', 'Có lỗi xảy ra khi đổi mật khẩu!');
            console.error('Change password error:', error);
        } finally {
            setLoadingState(passwordForm, false);
        }
    });

    // Real-time validation
    fullnameInput.addEventListener('input', () => {
        clearFieldError(fullnameInput);
    });

    newPasswordInput.addEventListener('input', () => {
        clearFieldError(newPasswordInput);
        clearFieldError(confirmPasswordInput);
    });

    confirmPasswordInput.addEventListener('input', () => {
        clearFieldError(confirmPasswordInput);
    });

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

    const showFieldError = (input, message) => {
        input.classList.add('is-invalid');
        let errorDiv = input.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            input.parentNode.insertBefore(errorDiv, input.nextSibling);
        }
        errorDiv.textContent = message;
    };

    const clearFieldError = (input) => {
        input.classList.remove('is-invalid');
        const errorDiv = input.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
            errorDiv.textContent = '';
        }
    };

    const showSuccess = (title, message) => {
        Swal.fire({
            icon: 'success',
            title: title,
            text: message,
            timer: 3000,
            showConfirmButton: false
        });
    };

    const showError = (title, message) => {
        Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonText: 'OK'
        });
    };
});

