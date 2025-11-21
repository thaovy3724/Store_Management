function showAlert(message, type = "error") {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: type, // "success", "error", "warning", "info", "question"
        title: message,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
    });
}