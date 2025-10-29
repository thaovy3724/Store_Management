document.addEventListener("DOMContentLoaded", function () {
    // Preview product image
    const imagePreview = document.getElementById('image-preview');
    const productImage = document.getElementById('product-image');
    const uploadBtn = document.getElementById('upload-btn');

    // Khi click vào khung hoặc nút upload => mở file selector
    imagePreview.addEventListener('click', () => productImage.click());
    uploadBtn.addEventListener('click', () => productImage.click());

    // Hiển thị preview ảnh khi chọn file
    productImage.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width:100%; max-height:100%;">`;
            }
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = '<span>Click để tải ảnh</span>';
        }
    });

    const modalTitle = document.getElementById("productModalTitle");
    const saveBtn = document.getElementById("productModalSaveBtn");
    const inputs = document.querySelectorAll("#productForm input, #productForm select");

    // Reset modal mỗi lần mở
    const resetModal = () => {
        inputs.forEach(el => {
            el.value = "";
            el.removeAttribute("readonly");
            el.removeAttribute("disabled");
        });
        uploadBtn.style.display = "inline-block";
        imagePreview.style.pointerEvents = "auto";
        imagePreview.style.opacity = "1";
        saveBtn.style.display = "inline-block";
    };

    // Click events
    document.addEventListener("click", async function (e) {
        const target = e.target.closest("[data-action]");
        if (!target) return;

        const action = target.getAttribute("data-action");
        switch (action) {
            case "view_add":
                resetModal();
                modalTitle.innerText = "Thêm sản phẩm mới";
                saveBtn.innerText = "Thêm";
                saveBtn.setAttribute("data-action", "add");
                break;

            case "view":
                resetModal();
                modalTitle.innerText = "Xem chi tiết sản phẩm";
                saveBtn.style.display = "none";
                inputs.forEach(el => {
                    if (el.tagName.toLowerCase() === "select") {
                        el.setAttribute("disabled", true);
                    } else {
                        el.setAttribute("readonly", true);
                    }
                });
                uploadBtn.style.display = "none";
                imagePreview.style.pointerEvents = "none";
                imagePreview.style.opacity = "0.6";
                break;

            case "view_edit":
                resetModal();
                modalTitle.innerText = "Chỉnh sửa sản phẩm";
                saveBtn.innerText = "Cập nhật";
                document.querySelector('[name="Barcode"]').setAttribute("readonly", true);
                saveBtn.setAttribute("data-action", "edit");
                break;

            case "delete":
                await deleteProduct(target.getAttribute("data-barcode"));
                break;

            case "add":
                await addProduct();
                break;

            case "update":
                break;
        }
    });
});

function validateForm(formData, action) {
    // Collect data
    var image = formData.get("ImageFile");
    var name = formData.get("ProductName");
    var category = formData.get("CategoryId");
    var price = formData.get("Price");
    var unit = formData.get("Unit");
    var barcode = formData.get("Barcode");
    var inventory = formData.get("InventoryQuantity");
    var supplier = formData.get("SupplierId");

    // Error message
    var imgeError = document.getElementById("product-image-error");
    var nameError = document.getElementById("product-name-error");
    var categoryError = document.getElementById("product-category-error");
    var priceError = document.getElementById("product-price-error");
    var unitError = document.getElementById("product-unit-error");
    var barcodeError = document.getElementById("product-barcode-error");
    var inventoryError = document.getElementById("product-inventory-error");
    var supplierError = document.getElementById("product-supplier-error");

    var isValid = true;

    // Implement validation logic here
    if (image && action == "add") {
        imgeError.innerText = "Vui lòng chọn ảnh cho sản phẩm";  
        isValid = false;
    }

    if (name == "") {
        nameError.innerText = "Tên sản phẩm không được để trống";
        isValid = false;
    }

    if (category == -1) {
        categoryError.innerText = "Loại sản phẩm không được để trống";
        isValid = false;
    }

    if (isNaN(price) || price <= 0) {
        priceError.innerText = "Giá của sản phẩm không hợp lệ";
        isValid = false;
    }

    if (unit == "") {
        unitError.innerText = "Đơn vị sản phẩm không được để trống";
        isValid = false;
    }

    if (supplier == -1) {
        supplierError.innerText = "Nhà cung cấp không được để trống";
        isValid = false;
    }

    if (barcode == "") {
        barcodeError.innerText = "Barcode không được để trống";
        isValid = false;
    } else if (!/^\d+$/.test(barcode)) {
        barcodeError.innerText = "Barcode không được chứa chữ";
        isValid = false;
    }

    if (isNaN(inventory) || inventory < 0) {
        inventoryError.innerText = "Tồn kho phải lớn hơn hoặc bằng 0";
        isValid = false;
    }

    return true; // Return true if valid, false otherwise
}

// Add function
async function addProduct() {
    // Create form data
    const formData = new FormData(document.getElementById("productForm"));
    
    // validate form data
    if (validateForm(formData, 'add')) {
        // Call API to add product
        try {
            const res = await fetch("/Product/Add", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (data.success) showAlert(data.message, 'success');
            else showAlert(data.message, 'error');
        } catch (error) {
            showAlert('Đã có lỗi xảy ra khi thêm dữ liệu.', 'error');
        }
    }
}

// Show detail function
async function showDetail(barcode) {
    try {
        // Gọi API xóa ở đây
        const res = await fetch(`/Product/Detail?barcode=${barcode}`, {
            method: "GET"
        });

        const data = await res.json();

        if (data.success) {
            // Xử lý dữ liệu trả về và hiển thị trong modal
            var viewModel = data.viewModel;
            document.querySelector('[name="ProductImage"]').value = viewModel.ProductImage;
            document.querySelector('[name="ProductName"]').value = viewModel.ProductName;
            document.querySelector('[name="CategoryId"]').value = viewModel.CategoryId;
            document.querySelector('[name="SupplierId"]').value = viewModel.SupplierId;
            document.querySelector('[name="Unit"]').value = viewModel.Unit;
            document.querySelector('[name="Barcode"]').value = viewModel.Barcode;
            document.querySelector('[name="InventoryQuantity"]').value = viewModel.InventoryQuantity;
            document.querySelector('[name="Price"]').value = viewModel.Price;
        } else showAlert(data.message, 'error');
    } catch (error) {
        showAlert('Đã có lỗi xảy ra khi truy xuất dữ liệu.', 'error');
    }
}

// Update function
async function updateProduct() {
    // Create form data
    const formData = new FormData(document.getElementById("productForm"));

    // validate form data
    if (validateForm(formData, 'edit')) {
        // Call API to add product
        try {
            const res = await fetch("/Product/Update", {
                method: "PUT",
                body: formData
            });

            const data = await res.json();

            if (data.success) showAlert(data.message, 'success');
            else showAlert(data.message, 'error');
        } catch (error) {
            showAlert('Đã có lỗi xảy ra khi cập nhật dữ liệu.', 'error');
        }
    }
}

// Delete function
async function deleteProduct(barcode) {
    const result = await Swal.fire({
        title: 'Bạn có chắc muốn xóa?',
        text: "Hành động này sẽ không thể hoàn tác!",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
        // Gọi API xóa ở đây
        const res = await fetch(`/Product/Delete?barcode=${barcode}`, {
            method: "POST"
        });

        const data = await res.json();

        if (data.success) {
            e.target.closest("tr")?.remove(); // ví dụ xóa dòng trong bảng
            showAlert(data.message, 'success');
        } else showAlert(data.message, 'error');
    } catch (error) {
        showAlert('Đã có lỗi xảy ra khi xóa dữ liệu.', 'error');
    }
};