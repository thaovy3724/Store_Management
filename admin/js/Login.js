document.getElementById("togglePassword").addEventListener("click", function() {
    const pwd = document.getElementById("password");
    const icon = this.querySelector("i");
    if (pwd.type === "password") {
    pwd.type = "text";
    icon.classList.replace("bi-eye-slash", "bi-eye");
    } else {
    pwd.type = "password";
    icon.classList.replace("bi-eye", "bi-eye-slash");
    }
});
