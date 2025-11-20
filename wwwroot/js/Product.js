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
            if (el.tagName === "SELECT") {
                el.value = "-1"; // chọn option có value = -1
            } else {
                el.value = "";   // input text, number, file, etc.
            }

            el.removeAttribute("readonly");
            el.removeAttribute("disabled");
        });

        uploadBtn.style.display = "inline-block";
        imagePreview.style.pointerEvents = "auto";
        imagePreview.style.opacity = "1";
        imagePreview.innerHTML = "<span>Click để tải ảnh</span>"
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
                const view_barcode = target.getAttribute("data-barcode");
                showDetail(view_barcode);
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
                const edit_barcode = target.getAttribute("data-barcode");
                showDetail(edit_barcode);
                modalTitle.innerText = "Chỉnh sửa sản phẩm";
                saveBtn.innerText = "Cập nhật";
                document.querySelector('[name="Barcode"]').setAttribute("readonly", true);
                saveBtn.setAttribute("data-action", "update");
                break;

            case "delete":
                await deleteProduct(target.getAttribute("data-barcode"));
                break;

            case "add":
                await addProduct();
                break;

            case "update":
                await updateProduct();
                break;
        }
    });

    function validateForm(formData, action) {
        const fields = {
            image: formData.get("ImageFile"),
            name: formData.get("ProductName"),
            category: formData.get("CategoryId"),
            price: formData.get("Price"),
            unit: formData.get("Unit"),
            barcode: formData.get("Barcode"),
            inventory: formData.get("InventoryQuantity"),
            supplier: formData.get("SupplierId"),
        };

        const errors = {
            image: document.getElementById("product-image-error"),
            name: document.getElementById("product-name-error"),
            category: document.getElementById("product-category-error"),
            price: document.getElementById("product-price-error"),
            unit: document.getElementById("product-unit-error"),
            barcode: document.getElementById("product-barcode-error"),
            inventory: document.getElementById("product-inventory-error"),
            supplier: document.getElementById("product-supplier-error"),
        };

        // Xóa toàn bộ lỗi cũ
        Object.values(errors).forEach(e => {
            e.classList.add("d-none");
            e.innerText = "";
        });

        let isValid = true;

        if ((!fields.image || fields.image.size === 0) && action === "add") {
            errors.image.classList.remove("d-none");
            errors.image.innerText = "Vui lòng chọn ảnh cho sản phẩm";
            isValid = false;
        }

        if (!fields.name) {
            errors.name.classList.remove("d-none");
            errors.name.innerText = "Tên sản phẩm không được để trống";
            isValid = false;
        }

        if (fields.category == -1) {
            errors.category.classList.remove("d-none");
            errors.category.innerText = "Vui lòng chọn loại sản phẩm";
            isValid = false;
        }

        if (isNaN(fields.price) || fields.price <= 0) {
            errors.price.classList.remove("d-none");
            errors.price.innerText = "Giá sản phẩm không hợp lệ";
            isValid = false;
        }

        if (!fields.unit) {
            errors.unit.classList.remove("d-none");
            errors.unit.innerText = "Vui lòng nhập đơn vị sản phẩm";
            isValid = false;
        }

        if (fields.supplier == -1) {
            errors.supplier.classList.remove("d-none");
            errors.supplier.innerText = "Vui lòng chọn nhà cung cấp";
            isValid = false;
        }

        if (!fields.barcode) {
            errors.barcode.classList.remove("d-none");
            errors.barcode.innerText = "Barcode không được để trống";
            isValid = false;
        } else if (!/^\d+$/.test(fields.barcode)) {
            errors.barcode.classList.remove("d-none");
            errors.barcode.innerText = "Barcode chỉ được chứa số";
            isValid = false;
        }

        if (isNaN(fields.inventory) || fields.inventory < 0) {
            errors.inventory.classList.remove("d-none");
            errors.inventory.innerText = "Tồn kho phải >= 0";
            isValid = false;
        }

        return isValid;
    }


    // Add function
    async function addProduct() {
        const form = document.getElementById("productForm");
        const formData = new FormData(form);

        if (validateForm(formData, 'add')) {
            try {
                const res = await fetch("/Product/Add", {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();

                if (data.success) {
                    showAlert(data.message, 'success');
                    // có thể load lại danh sách sản phẩm tại đây nếu cần
                    await new Promise(resolve => setTimeout(resolve, 1800));
                    window.location.href = "/Product/Index?page=1"
                    const modalEl = document.getElementById('productModal');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    modal.hide(); // Đóng modal đúng chuẩn Bootstrap
                    resetModal();
                } else {
                    showAlert(data.message, 'error');
                }
            } catch (error) {
                console.log(error);
                showAlert('Đã có lỗi xảy ra khi thêm dữ liệu.', 'error');
            }
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

                if (data.success) {
                    showAlert(data.message, 'success');
                    await new Promise(resolve => setTimeout(resolve, 1800));

                    const modalEl = document.getElementById('productModal');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    modal.hide(); // Đóng modal đúng chuẩn Bootstrap
                    resetModal();

                    const barcode = formData.get("Barcode");
                    const rows = document.querySelectorAll("#productList tr");
                    let row = null;

                    rows.forEach(r => {
                        const barcodeCell = r.querySelector("td:first-child");
                        if (barcodeCell && barcodeCell.textContent.trim() === barcode) {
                            row = r;
                        }
                    });

                    if (row) {
                        row.innerHTML = `
                        <td class="text-center">${data.product.barcode}</td>
                        <td class="text-center">
                            <img src="/uploads/${data.product.image}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">
                        </td>
                        <td class="text-center">${data.product.name}</td>
                        <td class="text-center">${data.product.price}</td>
                        <td class="text-center">${data.product.unit}</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-light border me-1 btn-view" title="Xem" data-bs-toggle="modal" data-bs-target="#productModal" data-action="view" data-barcode="${data.product.barcode}">
                                <i class="bi bi-eye text-primary"></i>
                            </button>
                            <button class="btn btn-sm btn-light border me-1 btn-edit" title="Sửa" data-bs-toggle="modal" data-bs-target="#productModal" data-action="view_edit" data-barcode="${data.product.barcode}">
                                <i class="bi bi-pencil text-success"></i>
                            </button>
                            <button class="btn btn-sm btn-light border btn-delete" data-barcode="${data.product.barcode}" title="Xóa" data-action="delete">
                                <i class="bi bi-trash text-danger"></i>
                            </button>
                        </td>
                    `;
                    }

                }
                else showAlert(data.message, 'error');
            } catch (error) {
                console.log(error);
                showAlert('Đã có lỗi xảy ra khi cập nhật dữ liệu.', 'error');
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
                const imagePreview = document.getElementById("image-preview");
                imagePreview.innerHTML = `<img src="/uploads/${viewModel.productImage}" class="img-fluid rounded" alt="Product Image" />`;
                document.querySelector('[name="ProductName"]').value = viewModel.productName;
                document.querySelector('[name="CategoryId"]').value = viewModel.categoryId;
                document.querySelector('[name="SupplierId"]').value = viewModel.supplierId;
                document.querySelector('[name="Unit"]').value = viewModel.unit;
                document.querySelector('[name="Barcode"]').value = viewModel.barcode;
                document.querySelector('[name="InventoryQuantity"]').value = viewModel.inventoryQuantity;
                document.querySelector('[name="Price"]').value = viewModel.price;
            } else showAlert(data.message, 'error');
        } catch (error) {
            console.log("hi");
            showAlert('Đã có lỗi xảy ra khi truy xuất dữ liệu.', 'error');
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
                const rows = document.querySelectorAll("#productList tr");
                for (const r of rows) {
                    const firstCell = r.querySelector("td:first-child");
                    if (firstCell && firstCell.textContent.trim() === String(barcode)) {
                        r.remove();
                        break;
                    }
                }
                showAlert(data.message, 'success');
            } else showAlert(data.message, 'error');
        } catch (error) {
            console.log(error);
            showAlert('Đã có lỗi xảy ra khi xóa dữ liệu.', 'error');
        }
    };

    function applyFilter() {
        const search = document.getElementById("searchInput").value.trim();
        const category = document.getElementById("filterCategory").value;
        const priceFrom = document.getElementById("filterPriceFrom").value;
        const priceTo = document.getElementById("filterPriceTo").value;

        const params = new URLSearchParams({
            page: 1,
            search: search || "",
            categoryId: category !== "-1" ? category : "",
            priceFrom: priceFrom || "",
            priceTo: priceTo || ""
        });

        window.location.href = `/Product/Index?${params.toString()}`;
    }

    // Bấm nút tìm kiếm
    document.getElementById("btnSearch").addEventListener("click", applyFilter);
    document.getElementById("searchInput").addEventListener("keypress", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            applyFilter();
        }
    });

    // Thay đổi filter
    ["filterCategory", "filterPriceFrom", "filterPriceTo"].forEach(id => {
        document.getElementById(id).addEventListener("change", applyFilter);
    });

    document.querySelectorAll('.btn-barcode').forEach(button => {
        button.addEventListener('click', async () => {
            const barcode = button.dataset.barcode;
            if (!barcode) return;

            const overlay = document.getElementById('loadingOverlay');

            try {
                // Hiện overlay
                overlay.classList.remove('d-none');

                // Gọi API tạo barcode
                const response = await fetch(`/Product/GetBarcodeImage?barcode=${barcode}`);
                if (!response.ok) throw new Error("Lỗi khi lấy barcode");

                const base64 = await response.json();

                // Hiển thị ảnh barcode
                const container = document.getElementById('barcodeImageContainer');
                container.innerHTML = `
                <div style="text-align:center">
                    <img src="data:image/png;base64,${base64}" alt="${barcode}" />
                </div>
            `;

                // Gán tên barcode cho nút tải
                const btnDownload = document.getElementById('btnDownloadBarcode');
                btnDownload.dataset.barcode = barcode;

                // Hiển thị modal
                const modal = new bootstrap.Modal(document.getElementById('barcodeModal'));
                modal.show();
            } catch (err) {
                alert(err.message);
            } finally {
                // Ẩn overlay sau khi hoàn tất
                overlay.classList.add('d-none');
            }
        });
    });

    document.getElementById('btnPrintBarcode').addEventListener('click', () => {
        const container = document.getElementById('barcodeImageContainer');
        const img = container.querySelector('img');

        if (!img) {
            alert("Chưa có barcode để in!");
            return;
        }

        const width = 500;
        const height = 600;

        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2) - 150;

        const printWindow = window.open('', '_blank',
            `width=${width},height=${height},top=${top},left=${left},resizable=no,scrollbars=no,status=no`);

        printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>In mã Barcode</title>
            <style>
                body {
                    font-family: 'Segoe UI', sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    background: #f9f9f9;
                }
                .barcode-container {
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                    text-align: center;
                    max-width: 90%;
                }
                img {
                    width: 300px;
                    height: auto;
                    margin-top: 10px;
                }
                h2 {
                    margin: 0;
                    color: #333;
                }
                p {
                    margin: 8px 0 0 0;
                    font-size: 14px;
                    color: #555;
                }
            </style>
        </head>
        <body>
            <div class="barcode-container">
                <h2>🏷️ Mã sản phẩm</h2>
                <img src="${img.src}" alt="Barcode" />
                <p>Quét mã để kiểm tra thông tin sản phẩm</p>
            </div>
            <script>
                window.onload = function() {
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 500);
                };
            </script>
        </body>
        </html>
        `);
        printWindow.document.close();
    });

    document.getElementById('btnDownloadBarcode').addEventListener('click', () => {
        const container = document.getElementById('barcodeImageContainer');
        const img = container.querySelector('img');
        const barcode = document.getElementById('btnDownloadBarcode').dataset.barcode; // ✅ lấy lại barcode

        if (!img) {
            alert("Chưa có barcode để tải!");
            return;
        }

        // Tạo link tạm để download
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `barcode_${barcode}.png`; // ✅ đặt tên theo mã
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});
