document.addEventListener("DOMContentLoaded", function () {
    // document.getElementById("togglePassword").addEventListener("click", function () {
    //     const pwd = document.getElementById("password");
    //     const icon = this.querySelector("i");
    //     if (pwd.type === "password") {
    //         pwd.type = "text";
    //         icon.classList.replace("bi-eye-slash", "bi-eye");
    //     } else {
    //         pwd.type = "password";
    //         icon.classList.replace("bi-eye", "bi-eye-slash");
    //     }
    // });
    const loginForm = document.getElementById("loginForm");
    const overlay = document.getElementById("loadingOverlay");

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = this.querySelector("[name='username']").value.trim();
        const password = this.querySelector("[name='password']").value.trim();
        const errUser = document.querySelector(".error-username");
        const errPwd = document.querySelector(".error-password");
        errUser.textContent = "";
        errPwd.textContent = "";

        if (!username) {
            errUser.textContent = "Tên đăng nhập không được để trống.";
            return;
        }
        if (!password) {
            errPwd.textContent = "Mật khẩu không được để trống.";
            return;
        }

        // Hiện overlay
        overlay.classList.remove("d-none");

        const formData = new FormData(this);

        try {
            const res = await fetch("/Auth/Login", {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                showAlert("Đăng nhập thành công", 'success');
                setTimeout(() => window.location.href = data.redirect, 500);
            } else {
                showAlert(data.message, 'error');
            }
        } catch (err) {
            console.error(err);
            showAlert("Không thể kết nối máy chủ, vui lòng thử lại!", 'error');
        } finally {
            // Ẩn overlay
            overlay.classList.add("d-none");
        }
    });
});
