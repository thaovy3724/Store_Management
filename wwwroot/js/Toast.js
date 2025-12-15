function showAlert(message, type = "error", timer = 4000) {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: type, // "success", "error", "warning", "info", "question"
        title: message,
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true
    });
}