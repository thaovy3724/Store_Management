document.addEventListener('DOMContentLoaded', function() {
    const modalTitle = document.getElementById("customerModalTitle");
    const customerForm = document.getElementById("customerForm");
    const saveBtn = document.getElementById("customerModalSaveBtn");
    const inputs = document.querySelectorAll("#customerForm input, #customerForm select, #customerForm textarea");
    const tableBody = document.getElementById("customerTableBody");
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    
    
    const customerId = document.getElementById("customerId");
    const cusomterFullname = document.getElementById("fullname");
    const phonenumber = document.getElementById("phonenumber");
    const customerEmail = document.getElementById("customeremail");
    const customerAddress = document.getElementById("address");
    
    // Reset modal
    const resetModal = () => {
        // Xóa các dữ liệu đang có trên form
        customerForm.reset();
        
        // Xóa các dòng cảnh báo đỏ
        document.querySelectorAll(".form-text").forEach(element => {
           element.textContent = ""; 
        });
        
        // Xóa trạng thái disable của các thẻ inputs 
        inputs.forEach(element => {
            element.removeAttribute('disabled');
            element.removeAttribute('readonly');
            element.classList.remove("is-invalid");
        });
        
        document.getElementById("customerId").value = 0;
        saveBtn.style.display = "inline-block";
    };

    // Thêm mới
    document.querySelectorAll(".btn-add").forEach(btn => {
        btn.addEventListener("click", () => {
            resetModal();
            modalTitle.innerText = "Thêm khách hàng mới";
            saveBtn.innerText = "Thêm";
        });
    });
    
    // Validate form 
    // TODO: Fullname, Phone bắt buộc -> trên controller kiểm tra tồn tại = sđt
    const formValidate = (fullname, phone, email, address) => {
        // Clear previous messages
        document.querySelectorAll(".form-text").forEach(message => {
           message.textContent = ""; 
        });
        
        inputs.forEach(element => {
           element.classList.remove("is-invalid"); 
        });
        
        const fullnameMsg = document.getElementById("fullname-msg");
        const emailMsg = document.getElementById("customeremail-msg");
        const phoneMsg = document.getElementById("phonenumber-msg");
        const addressMsg = document.getElementById("address-msg");

        let isValid = true;

        let phoneRegex = /^0[0-9]{9}$/;
        let emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/;
        let addressRegex = /^(\d+(\/\d+)?(\/\d*[A-Z]?\d*)?|[A-Z]\d+(\s[A-Z]\d+)?)\s[\p{L}]+([\s\p{L}\d\.,\-]+)*$/u;

        // Validate name
        if(fullname.trim() === "") {
            fullnameMsg.textContent = "Họ tên không để trống";
            cusomterFullname.classList.add("is-invalid");
            isValid = false;
        }

        // Validate email
        if (email !== null && !emailRegex.test(email)) {
            emailMsg.textContent = 'Email không hợp lệ.';
            customerEmail.classList.add('is-invalid');
            isValid = false;
        }

        // Validate phone number
        if (phone == null) {
            phoneMsg.textContent = 'Số điện thoại không được để trống.';
            phonenumber.classList.add('is-invalid');
            isValid = false;
        } else if (!phoneRegex.test(phone)) {
            phoneMsg.textContent = 'Sai định dạng số điện thoại.';
            phonenumber.classList.add('is-invalid');
            isValid = false;
        }

        // Validate address số cách rồi thêm 1 chuỗi chữ
        if(address != null && !addressRegex.test(address)){
            addressMsg.textContent = 'Vui lòng nhập địa chỉ đúng định dạng.';
            customerAddress.classList.add("is-invalid");
            isValid = false;
        }

        return isValid;
    };
    
    // Load lại danh sách customer
    const loadCustomers = async () => {
        const response = await fetch("Customer/GetCustomers");
        const result = await response.json();
        const customers = result.data;

        if (result.success) {
            renderTable(customers);
        } else {
            showAlert("Có lỗi xảy ra lấy dữ liệu", "error");
        }
    }
    
    const renderTable = (customers) => {
        tableBody.innerHTML = '';
        if(customers.length === 0) {
            tableBody.innerHTML = `
                <tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>
            `;
        } else {
            customers.forEach(customer => {
               const row = `
                <tr class="text-center">
                    <td class="text-center">${customer.customerId}</td>
                    <td>${customer.name}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.email}</td>
                    <td class="text-center">
                       <button class="btn btn-sm btn-light border me-1 btn-view" data-id=${customer.customerId} title="Xem" data-bs-toggle="modal" data-bs-target="#customerModal">
                            <i class="bi bi-eye text-primary"></i>
                        </button>
                        <button class="btn btn-sm btn-light border me-1 btn-edit" data-id=${customer.customerId} title="Sửa" data-bs-toggle="modal" data-bs-target="#customerModal">
                            <i class="bi bi-pencil text-success"></i>
                        </button>
                        <button class="btn btn-sm btn-light border btn-delete" data-id=${customer.customerId} title="Xóa">
                            <i class="bi bi-trash text-danger"></i>
                        </button>
                    </td>
                </tr>
               `; 
               tableBody.innerHTML += row;
            });
        }
    }
    
    // Submit form
    customerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = customerId.value;
        const fullname = cusomterFullname.value;
        const phone = phonenumber.value === "" ? null : phonenumber.value;
        const email = customerEmail.value === "" ? null : customerEmail.value;
        const address = customerAddress.value === "" ? null : customerAddress.value;
        
        if (!formValidate(fullname, phone, email, address)) {
            return;
        }

        const formData = new FormData();
        formData.append('Name', fullname);
        if (phone) formData.append('Phone', phone);
        if (email) formData.append('Email', email);
        if (address) formData.append('Address', address);
        formData.append('__RequestVerificationToken',
            document.querySelector('input[name="__RequestVerificationToken"]').value);

        // Gửi dữ liệu qua controller
        try {
            const url = id === "0" ? "/Customer/Create" : `/Customer/Edit/${id}`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json(); 
            
            if(result.success) {
                // Đóng modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('customerModal'));
                modal.hide();
                
                await loadCustomers();
                
                showAlert(result.message, "success");
            } else {
                showAlert(result.message, "error");
            }
            
        } catch (error) {
            console.log("Có lỗi xảy ra khi submit form!")
        }
    });

    // Xem chi tiết + Chỉnh sửa
    document.addEventListener('click', async function(e) {
        const viewBtn = e.target.closest(".btn-view");
        const editBtn = e.target.closest(".btn-edit");
        if ( viewBtn || editBtn ) {
            let id = null;
            if (viewBtn) {
                id = viewBtn.getAttribute("data-id");
            } else if (editBtn) {
                id = editBtn.getAttribute("data-id");
            }

            try {
                const response = await fetch(`/Customer/GetCustomer/${id}`);
                const result = await response.json();

                if (result.success) {
                    resetModal();

                    const customer = result.data;
                    customerId.value = customer.customerId;
                    cusomterFullname.value = customer.name;
                    phonenumber.value = customer.phone;
                    customerEmail.value = customer.email;
                    customerAddress.value = customer.address;
                    if (viewBtn) {
                        modalTitle.innerText = "Xem chi tiết khách hàng";
                        saveBtn.style.display = "none";
                        inputs.forEach(el => {

                            el.setAttribute("readonly", true);
                            el.setAttribute("disabled", true);

                        });
                    } else if (editBtn) {
                        modalTitle.innerText = "Cập nhật chi tiết khách hàng";
                    }
                } else {
                    showAlert(result.message, 'error');
                }
            } catch (error) {
                showAlert('Không thể tải dữ liệu', 'error');
            }
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
                    const response = await fetch(`Customer/Delete/${id}`, {
                        method: 'POST'
                    });
                    const result = await response.json();

                    if (result.success) {
                        showAlert(result.message, "success");
                        await loadCustomers();
                    } else {
                        showAlert(result.message, "error");
                    }
                }
            });
        }
    });
    function applyFilter() {
        const search = document.getElementById("searchInput").value.trim();

        const params = new URLSearchParams({
            page: 1,
            search: search || "",
        });

        window.location.href = `/Customer/Index?${params.toString()}`;
    }
    
    searchBtn.addEventListener("click", applyFilter);
    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            applyFilter();
        }
    });
});