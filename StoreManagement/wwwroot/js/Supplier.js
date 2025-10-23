document.addEventListener("DOMContentLoaded", function () {
    // Load danh sách nhà cung cấp
    loadSuppliers();
    
    
    const modalTitle = document.getElementById("supplierModalTitle");
    const saveBtn = document.getElementById("supplierModalSaveBtn");
    const inputs = document.querySelectorAll("#supplierForm input, #supplierForm select, #supplierForm textarea");
    
    
    
    // Reset modal mỗi lần mở
    const resetModal = () => {
        document.getElementById('supplierForm').reset();
        let textMessage = document.querySelectorAll('.text-msg');
        textMessage.forEach(element => {
            element.textContent = '';
        });
        inputs.forEach(el => {
            el.removeAttribute("readonly");
            el.removeAttribute("disabled");
        });
        document.getElementById("supplierId").value = 0;
        saveBtn.style.display = "inline-block";
    };

    // Thêm mới
    document.querySelectorAll(".btn-add").forEach(btn => {
        btn.addEventListener("click", () => {
            resetModal();
            modalTitle.innerText = "Thêm nhà cung cấp mới";
            saveBtn.innerText = "Thêm";
        });
    });
    
    // Xem chi tiết
    $(document).on('click', '.btn-view', function() {
        const id = $(this).data('id');
        
        $.ajax({
            url: "/Supplier/GetSupplierDetail",
            type: "GET",
            contentType: "application/json",
            data: { id: id },
            success: function(res) {
                if(res.success) {
                    resetModal();
                    modalTitle.innerText = "Xem chi tiết nhà cung cấp";
                    saveBtn.style.display = "none"; // ẩn nút Lưu
                    
                    let supplier = res.data;
                    
                    $('#supplierId').val(supplier.id);
                    $('#fullname').val(supplier.name).attr('readonly', true);
                    $('#phonenumber').val(supplier.phone).attr('readonly', true);
                    $('#supplieremail').val(supplier.email).attr('readonly', true);
                    $('#address').val(supplier.address).attr('readonly', true);
                    
                } else {
                    showAlert(res.message, "error");
                }
            }
        });
    });

    // Chỉnh sửa
    $(document).on('click', '.btn-edit', function() {
        const id = $(this).data('id');

        $.ajax({
            url: "/Supplier/GetSupplierDetail",
            type: "GET",
            contentType: "application/json",
            data: { id: id },
            success: function(res) {
                if(res.success) {
                    resetModal();
                    modalTitle.innerText = "Chỉnh sửa nhà cung cấp";
                    saveBtn.innerText = "Cập nhật";

                    let supplier = res.data;

                    $('#supplierId').val(supplier.id);
                    $('#fullname').val(supplier.name);
                    $('#phonenumber').val(supplier.phone);
                    $('#supplieremail').val(supplier.email);
                    $('#address').val(supplier.address);

                } else {
                    showAlert(res.message, "error");
                }
            }
        });
    });

    
    // Khi nhấn nút Lưu
    document.getElementById("supplierModalSaveBtn").addEventListener(
        "click", function (event) {
            
            event.preventDefault();
            
            var fullname = $('#supplierForm input[name="fullname"]').val();
            var email = $('#supplierForm input[name="supplieremail"]').val();
            var phonenumber = $('#supplierForm input[name="phonenumber"]').val();
            var address = $('#supplierForm textarea[name="address"]').val();

            var isValidData = formValidateSupplier(fullname, email, phonenumber, address);
            
            if (!isValidData) {
                showAlert("Dữ liệu không hợp lệ", "error")
                return;
            }
            
            const data = {
              Id: parseInt($('#supplierId').val()),
              Name: fullname,
              Phone: phonenumber,
              Email: email,
              Address: address  
            };

            // Lấy token từ form
            var token = $('#supplierForm input[name="__RequestVerificationToken"]').val();
            
            $.ajax({
                url: "/Supplier/SaveSupplier",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(data),
                headers: {
                    'RequestVerificationToken': token
                },
                success: function (response) {
                    if(response.success) {
                        showAlert(response.message, "success");
                        
                        // Tắt modal và tự động load lại table
                        $('#supplierModal').modal('hide');
                        loadSuppliers();
                    } else {
                        showAlert(response.message, "error");
                    }
                }
            })
        }
    );
    
    // Tìm kiếm nhà cung cấp
        // Mỗi lần thay đổi ô input#search thì gọi ajax (không muốn gọi ajax liên tục -> bỏ)
    $(document).on('input', '#search', function() {
        loadSuppliers();
    });
    $(document).on('click', ".btn-search", function() {
        loadSuppliers();
    });
});

// Load suppliers
function loadSuppliers() {
    const kyw = $('#search').val().trim();
    
    $.ajax({
        url: "/Supplier/GetSuppliers",
        type: "GET",
        data: { search: kyw },
        success: function(response) {
            if(response.success) {
                renderTable(response.data);
            } else {
                showAlert("Xin lỗi, có lỗi khi lấy dữ liệu nhà cung cấp!")
            }
        }
    });

    // Nút xóa
    $(document).on('click', '.btn-delete', function() {
        const id = parseInt($(this).data('id'));
        Swal.fire({
            title: 'Bạn có chắc muốn xóa?',
            text: "Hành động này sẽ không thể hoàn tác!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "/Supplier/DeleteSupplier",
                    type: "POST",
                    data: { id: id },
                    success: function(res) {
                       if(res.success) {
                           showAlert(res.message, "success");
                           loadSuppliers();
                       } else {
                           showAlert(res.message, "error");
                       }
                   } 
                });
            }
        });
    })
}

function renderTable(suppliers) {
    const body = $('#tableBody');
    body.empty();

    if (suppliers.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="5" class="text-center">Không có dữ liệu</td>
            </tr>
        `);
        return;
    }
    
    suppliers.forEach(s => {
        body.append(
            `
            <tr class="text-center">
                <td class="text-center">${s.id}</td>
                <td>${s.name}</td>
                <td>${s.phone}</td>
                <td>${s.address}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-light border me-1 btn-view" data-id=${s.id} title="Xem" data-bs-toggle="modal" data-bs-target="#supplierModal">
                        <i class="bi bi-eye text-primary"></i>
                    </button>
                    <button class="btn btn-sm btn-light border me-1 btn-edit" data-id=${s.id} title="Sửa" data-bs-toggle="modal" data-bs-target="#supplierModal">
                        <i class="bi bi-pencil text-success"></i>
                    </button>
                    <button class="btn btn-sm btn-light border btn-delete" data-id=${s.id} title="Xóa">
                        <i class="bi bi-trash text-danger"></i>
                    </button>
                </td>
            </tr>
            `
        );
    });
}

// Validate Form
function formValidateSupplier(ten, email, dienthoai, diachi) {
    // Clear previous messages
    $('.text-msg').text('');

    let isValid = true;

    let phoneRegex = /^0[0-9]{9}$/;
    let emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/;
    let soNhaRegex = /^(\d+(\/\d+)?(\/\d*[A-Z]?\d*)?|[A-Z]\d+(\s[A-Z]\d+)?)\s[\p{L}]+([\s\p{L}\d\.,\-]+)*$/u;
    
    // Validate name
    if(ten.trim() === "") {
        $('#fullname-msg').text("Tên không được để trống");
        isValid = false;
    }

    // Validate email
    if (email == '') {
        $('#supplieremail-msg').text('Vui lòng nhập email.');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        $('#supplieremail-msg').text('Email không hợp lệ.');
        isValid = false;
    }

    // Validate phone number
    if (dienthoai == '') {
        $('#phonenumber-msg').text('Vui lòng nhập số điện thoại.');
        isValid = false;
    } else if (!phoneRegex.test(dienthoai)) {
        $('#phonenumber-msg').text('Sai định dạng số điện thoại.');
        isValid = false;
    }

    // Validate address số cách rồi thêm 1 chuỗi chữ
    if (diachi == '') {
        $('#address-msg').text('Vui lòng nhập địa chỉ.');
        isValid = false;
    }else if(!soNhaRegex.test(diachi)){
        $('#address-msg').text('Vui lòng nhập địa chỉ đúng định dạng.');
        isValid = false;
    }
    
    return isValid;
}



