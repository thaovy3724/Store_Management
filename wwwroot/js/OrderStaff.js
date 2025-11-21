// -------------------------------------------------------- Thêm khách hàng

window.selectedCustomerId = null;
document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("paymentSuccess");
    const orderId = params.get("orderId");

    if (success === "true") {
        Swal.fire({
            icon: 'success',
            title: 'Thanh toán thành công!',
            text: `Đơn hàng #${orderId} đã được tạo.`,
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href =`/OrderStaff/`;
            }
        });

        localStorage.clear();
    }
    else if (success === "false") {
        Swal.fire({
            icon: 'error',
            title: 'Thanh toán thất bại!',
            text: 'Vui lòng thử lại.',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = `/OrderStaff/`;
            }
        });
    }

    // Khuyến mãi trong localStorage
    const promoSaved = localStorage.getItem("selectedPromotion");
    if (promoSaved) {
        const { promoCode, discountValue } = JSON.parse(promoSaved);

        document.getElementById('selectedPromotionInput').value = `${promoCode} - ${discountValue}`;
        document.getElementById('selectedPromotionText').innerText = `Khuyến mãi: ${promoCode} - ${discountValue}`;

        // Nếu cần reset lại selectedPromotionId để đúng radio
        const radios = document.querySelectorAll('#promotionTableBody input[name="promotion"]');
        radios.forEach(radio => {
            const tr = radio.closest('tr');
            if (tr.children[1].innerText === promoCode) {
                radio.checked = true;
                selectedPromotionId = radio.value;
            }
        });

        updatePaymentInfo();
    }
    // Khách hàng trong localStorage
    const customerSaved = localStorage.getItem("selectedCustomer");
    if (customerSaved) {
        const { id, name, phone } = JSON.parse(customerSaved);
        document.getElementById("customerPhoneInput").value = phone;
        document.getElementById("customerInfo").innerText = `Tên: ${name}, SĐT: ${phone}`;
        document.getElementById("customerSuggestions").style.display = "none";
        window.selectedCustomerId = id;
    }

    window.submitAddCustomer = function () {

        if (!validateCustomerForm()) return;

        var $form = $("#addCustomerForm");
        var formData = $form.serialize();
        var addCustomerUrl = $form.data("url"); 
        console.log("Form data:", formData);
        console.log("Gửi đến:", addCustomerUrl);


        $.ajax({
            url: addCustomerUrl,
            type: 'POST',
            data: formData,
            success: function (res) {
                if (res.success) {
                    const newCustomer = {
                        id: res.customerId,
                        name: res.customerName,
                        phone: phone
                    };
                    localStorage.setItem("selectedCustomer", JSON.stringify(newCustomer));
                    showAlert('Đã thêm khách hàng: ' + res.customerName, 'success');
                    window.selectedCustomerId = res.customerId;
                    console.log("==> Gán selectedCustomerId khi thêm khách:", window.selectedCustomerId);
                    const phone = $form.find('input[name="Phone"]').val();
                    document.getElementById("customerPhoneInput").value = phone;

                    var modalEl = document.getElementById('modalThemKhach');
                    var modal = bootstrap.Modal.getInstance(modalEl);

                    modalEl.addEventListener('hidden.bs.modal', function handler() {
                        const phoneInputEl = document.getElementById("customerPhoneInput");
                        phoneInputEl.focus();

                        const query = phoneInputEl.value.trim();
                        if (query !== "") {
                            fetch(`/OrderStaff/SearchCustomer?phone=${encodeURIComponent(query)}`)
                                .then(res => res.json())
                                .then(data => renderSuggestions(data))
                                .catch(err => console.error("Lỗi khi tìm khách hàng:", err));
                        }

                        modalEl.removeEventListener('hidden.bs.modal', handler);
                    });

                    modal.hide();
                    $form[0].reset();
                } else {
                    showAlert(res.message, 'warning');
                }
            },
            error: function (xhr) {
                let errorMsg = 'Thêm khách hàng thất bại';

                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    errorMsg = xhr.responseText;
                } else if (xhr.statusText) {
                    errorMsg = xhr.statusText;
                }
                showAlert('Lỗi' + errorMsg, 'erro');

                console.error('Chi tiết lỗi:', xhr);
            }
        });

    }
    // Validate Form thêm khách hàng
    function validateCustomerForm() {
        let isValid = true;
        const name = $("#addCustomerForm [name='Name']").val().trim();
        const phone = $("#addCustomerForm [name='Phone']").val().trim();
        const email = $("#addCustomerForm [name='Email']").val().trim();
        const address = $("#addCustomerForm [name='Address']").val().trim();

        $("#addCustomerForm .invalid-feedback").remove();

        const phoneRegex = /^0[0-9]{9}$/;
        const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/;
        const addressRegex = /^(\d+(\/\d+)?(\/\d*[A-Z]?\d*)?|[A-Z]\d+(\s[A-Z]\d+)?)\s[\p{L}]+([\s\p{L}\d\.,\-]+)*$/u;

        if (!name) {
            $("#addCustomerForm [name='Name']")
                .addClass("is-invalid")
                .after('<div class="invalid-feedback">Tên khách hàng không được để trống.</div>');
            isValid = false;
        } else {
            $("#addCustomerForm [name='Name']").removeClass("is-invalid");
        }

        if (!phone) {
            $("#addCustomerForm [name='Phone']")
                .addClass("is-invalid")
                .after('<div class="invalid-feedback">Số điện thoại không được để trống.</div>');
            isValid = false;
        } else if (!phoneRegex.test(phone)) {
            $("#addCustomerForm [name='Phone']")
                .addClass("is-invalid")
                .after('<div class="invalid-feedback">Số điện thoại không hợp lệ (VD: 0901234567).</div>');
            isValid = false;
        } else {
            $("#addCustomerForm [name='Phone']").removeClass("is-invalid");
        }

        if (email && !emailRegex.test(email)) {
            $("#addCustomerForm [name='Email']")
                .addClass("is-invalid")
                .after('<div class="invalid-feedback">Email không hợp lệ.</div>');
            isValid = false;
        } else {
            $("#addCustomerForm [name='Email']").removeClass("is-invalid");
        }

        if (address && !addressRegex.test(address)) {
            $("#addCustomerForm [name='Address']")
                .addClass("is-invalid")
                .after('<div class="invalid-feedback">Vui lòng nhập địa chỉ hợp lệ (VD: 123 Nguyễn Trãi, Q1).</div>');
            isValid = false;
        } else {
            $("#addCustomerForm [name='Address']").removeClass("is-invalid");
        }

        return isValid;
    }
    function applyFilter() {
        const categoryId = document.querySelector(".filter-category").value;
        const search = document.getElementById("filter-search").value.trim();

        const params = new URLSearchParams({
            page: 1,
            search: search || "",
            categoryId: categoryId
        });

        window.location.href = `/OrderStaff/Index?${params.toString()}`;
    }

    // Khi nhấn nút tìm kiếm
    document.getElementById("btnSearch").addEventListener("click", applyFilter);

    // Khi nhấn Enter trong ô tìm kiếm
    document.getElementById("filter-search").addEventListener("keypress", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            applyFilter();
        }
    });

    // Khi đổi danh mục trong combobox
    document.querySelector(".filter-category").addEventListener("change", applyFilter);
});

const phoneInput = document.getElementById("customerPhoneInput");
const suggestionBox = document.getElementById("customerSuggestions");
const customerInfo = document.getElementById("customerInfo");

let currentIndex = -1;
let suggestions = [];

function positionSuggestionBox() {
    const rect = phoneInput.getBoundingClientRect();
    suggestionBox.style.top = rect.bottom + window.scrollY + "px";
    suggestionBox.style.left = rect.left + window.scrollX + "px";
    suggestionBox.style.width = rect.width + "px";
}

function renderSuggestions(data) {
    suggestionBox.innerHTML = "";
    suggestions = data;
    currentIndex = -1;

    if (!data || data.length === 0) {
        suggestionBox.style.display = "none";
        return;
    }

    data.forEach((c, index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "list-group-item list-group-item-action";
        item.textContent = `${c.name} - ${c.phone}`;

        item.addEventListener("click", (e) => {
            e.stopPropagation(); 
            selectCustomer(c);
        });

        item.addEventListener("mouseenter", () => {
            highlightItem(index);
        });

        suggestionBox.appendChild(item);
    });

    positionSuggestionBox();
    suggestionBox.style.display = "block";

    highlightItem(0);
}

function highlightItem(index) {
    const items = suggestionBox.children;
    for (let i = 0; i < items.length; i++) {
        items[i].classList.toggle("active", i === index);
    }
    currentIndex = index;
}

function selectCustomer(c) {
    phoneInput.value = c.phone;
    customerInfo.innerText = `Tên: ${c.name}, SĐT: ${c.phone}`;
    suggestionBox.style.display = "none";
    window.selectedCustomerId = c.customerId;
    const newCustomer = {
        id: c.customerId,
        name: c.name,
        phone: c.phone
    };
    localStorage.setItem("selectedCustomer", JSON.stringify(newCustomer));
    console.log("==> Gán selectedCustomerId:", window.selectedCustomerId);
}

phoneInput.addEventListener("input", async () => {
    const query = phoneInput.value.trim();
    if (!query) {
        suggestionBox.style.display = "none";
        return;
    }

    try {
        const res = await fetch(`/OrderStaff/SearchCustomer?phone=${encodeURIComponent(query)}`);
        const data = await res.json();
        renderSuggestions(data);
    } catch (err) {
        console.error("Lỗi khi tìm khách hàng:", err);
        suggestionBox.style.display = "none";
    }
});

phoneInput.addEventListener("keydown", (e) => {
    const items = suggestionBox.children;
    if (items.length === 0) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        let nextIndex = currentIndex + 1;
        if (nextIndex >= items.length) nextIndex = 0;
        highlightItem(nextIndex);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = items.length - 1;
        highlightItem(prevIndex);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentIndex >= 0 && currentIndex < suggestions.length) {
            selectCustomer(suggestions[currentIndex]);
        }
    }
});

document.addEventListener("mousedown", (e) => {
    if (e.target !== phoneInput && !suggestionBox.contains(e.target)) {
        suggestionBox.style.display = "none";
    }
});

phoneInput.addEventListener("click", (e) => e.stopPropagation());


// -------------------------------------------------------- Camera quét barcode
let scannerInstance = null;
let isCameraOn = false;

const toggleBtn = document.getElementById("toggleScannerBtn");

toggleBtn.addEventListener("click", () => {
    if (!isCameraOn) {
        // Bật
        scannerInstance = new Html5QrcodeScanner('reader', {
            qrbox: { width: 450, height: 400 },
            fps: 20
        });
        scannerInstance.render(success, error);

        isCameraOn = true;
        toggleBtn.classList.remove("btn-outline-primary");
        toggleBtn.classList.add("btn-danger");
        toggleBtn.innerHTML = `<i class="bi bi-stop-circle"></i>`;
    } else {
        // Tắt
        scannerInstance.clear().then(() => {
            document.getElementById("reader").innerHTML = "";
        }).catch(err => console.error("Lỗi khi tắt scanner:", err));

        isCameraOn = false;
        toggleBtn.classList.remove("btn-danger");
        toggleBtn.innerHTML = `<i class="bi bi-upc-scan"></i>`;
    }
});

function success(result) {
    console.log("Quét được mã:", result);

    const barcode = result.trim();
    console.log("Barcode quét được:", barcode);

    // Gọi API backend để tìm sản phẩm thật
    fetchProductByBarcode(barcode);

}

function error(err) {
    console.error("Lỗi khi quét:", err);
}
//----------------------------------------------Giỏ hàng---------------------

const cartBody = document.querySelector("#cart-body"); 

// Lấy giỏ hàng từ localStorage
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

// Lưu giỏ hàng vào localStorage
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Hiển thị giỏ hàng trên bảng
function renderCart() {
    const cart = getCart();
    cartBody.innerHTML = "";

    if (cart.length === 0) {
        cartBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Giỏ hàng trống</td></tr>`;
        return;
    }

    cart.forEach(item => {
        const row = document.createElement("tr");
        row.dataset.id = item.productId;
        row.innerHTML = `
            <td><button class="btn btn-sm btn-danger btn-remove">&times;</button></td>
            <td>${item.name}</td>
            <td>${item.price.toLocaleString()} đ</td>
            <td>
                <div class="d-flex justify-content-center align-items-center">
                    <div class="input-group input-group-sm" style="width:auto;">
                        <button class="btn btn-outline-primary btn-minus">-</button>
                        <input type="text" class="form-control text-center qty-input" value="${item.quantity}" style="max-width:50px">
                        <button class="btn btn-outline-primary btn-plus">+</button>
                    </div>
                </div>
            </td>
            <td class="row-total">${(item.price * item.quantity).toLocaleString()} đ</td>
        `;
        cartBody.appendChild(row);
    });
}
// Thông tin thanh toán
function updatePaymentInfo() {
    const cart = getCart();

    // Tổng tiền hàng
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Giảm giá từ khuyến mãi (nếu có)
    let discount = 0;
    if (selectedPromotionId) {
        const promoRow = document.querySelector(`#promotionTableBody input[name="promotion"][value="${selectedPromotionId}"]`);
        if (promoRow) {
            const discountText = promoRow.closest('tr').children[4].innerText;
            if (discountText.includes('%')) {
                // Giảm theo %
                const percent = parseFloat(discountText.replace('%', ''));
                discount = total * percent / 100;
            } else if (discountText.includes('đ')) {
                // Giảm theo tiền
                discount = parseInt(discountText.replace(/[^0-9]/g, '')) || 0;
            }
        }
    }

    // Thành tiền
    const finalAmount = total - discount;

    // Cập nhật giao diện
    document.getElementById('totalAmount').innerText = total.toLocaleString('vi-VN') + 'đ';
    document.getElementById('discountAmount').innerText = '-' + discount.toLocaleString('vi-VN') + 'đ';
    document.getElementById('finalAmount').innerText = finalAmount.toLocaleString('vi-VN') + 'đ';
}

// Gọi API backend để lấy sản phẩm qua barcode
let isScanning = false;

async function fetchProductByBarcode(barcode) {
    if (isScanning) return;
    isScanning = true;

    try {
        const response = await fetch(`/OrderStaff/GetProductByBarcode?barcode=${barcode}`);
        const data = await response.json();

        if (!data.success) {
            Swal.fire('Không tìm thấy', data.message, 'warning');
            return;
        }

        const p = data.data;
        if (p.quantity <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Hết hàng',
                text: `${p.productName} hiện đã hết hàng, không thể thêm vào giỏ.`,
            });
            return;
        }

        addToCart(p.productId, p.productName, p.price);
        playBeep();

        Swal.fire({
            icon: 'success',
            title: 'Đã thêm',
            text: `${p.productName} đã được thêm vào giỏ hàng!`,
            timer: 1800,
            showConfirmButton: false
        });

        // Tạm khóa quét trong 5s
        await new Promise(resolve => setTimeout(resolve, 2500));
    } catch (err) {
        console.error('Lỗi khi gọi API barcode:', err);
        Swal.fire('Lỗi', 'Không thể kết nối tới máy chủ!', 'error');
    } finally {
        isScanning = false;
    }
}

function playBeep() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine'; // dạng sóng
    osc.frequency.setValueAtTime(1000, ctx.currentTime); // tần số 1000Hz
    gain.gain.setValueAtTime(0.2, ctx.currentTime); // âm lượng

    osc.start();
    osc.stop(ctx.currentTime + 0.15); // phát 150ms
}

// Thêm sản phẩm vào giỏ
function addToCart(id, name, price) {
    let cart = getCart();
    let existing = cart.find(x => x.productId == id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            productId: id,
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart(cart);
    renderCart();

    showAlert('Đã thêm ' + name + ' vào giỏ hàng', 'success');




}

// Xóa sản phẩm, tăng/giảm số lượng, nhập số lượng
document.addEventListener("click", function (e) {
    let cart = getCart();

    if (e.target.classList.contains("btn-remove")) {
        const id = e.target.closest("tr").dataset.id;
        cart = cart.filter(x => x.productId != id);
        saveCart(cart);
        renderCart();
    }

    if (e.target.classList.contains("btn-plus") || e.target.classList.contains("btn-minus")) {
        const row = e.target.closest("tr");
        const id = row.dataset.id;
        const item = cart.find(x => x.productId == id);
        if (!item) return;

        if (e.target.classList.contains("btn-plus")) item.quantity++;
        if (e.target.classList.contains("btn-minus") && item.quantity > 1) item.quantity--;

        saveCart(cart);
        renderCart();
    
    }
    updatePaymentInfo();
});

//  Nhập số lượng thủ công
document.addEventListener("input", function (e) {
    if (e.target.classList.contains("qty-input")) {
        const id = e.target.closest("tr").dataset.id;
        let cart = getCart();
        const item = cart.find(x => x.productId == id);
        let val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0) {
            item.quantity = val;
            saveCart(cart);
            renderCart();
            updatePaymentInfo();
        }
    }
});

// Click chọn sản phẩm
document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => {
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price);
        const quantity = parseInt(card.dataset.quantity || 0);

        if (quantity <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Hết hàng',
                text: `${name} hiện đã hết hàng!`
            });
            return;
        }

        addToCart(id, name, price);
        card.classList.add("selected");
        setTimeout(() => card.classList.remove("selected"), 300);
        updatePaymentInfo();
    });
});


// Load giỏ hàng khi reload trang
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    updatePaymentInfo();
});


//------------------------------------------------------------- Xử lý chọn Khuyến Mãi
let selectedPromotionId = null;

document.getElementById("promotionModal").addEventListener("show.bs.modal", async () => {
    const cart = getCart();
    const orderTotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

    try {
        const [validRes, invalidRes] = await Promise.all([
            fetch(`/OrderStaff/GetApplicablePromotionsValid?orderTotal=${orderTotal}`),
            fetch(`/OrderStaff/GetApplicablePromotionsInValid?orderTotal=${orderTotal}`)
        ]);
        const validData = await validRes.json();
        const invalidData = await invalidRes.json();

        const tbody = document.getElementById("promotionTableBody");
        tbody.innerHTML = "";

        // Khuyến mãi hợp lệ
        if (validData.length > 0) {
            const trHeader = document.createElement("tr");
            trHeader.innerHTML = `<td colspan="6" class="text-start fw-bold p-2" style="background-color:#e8f5e9; border-bottom:1px solid #c8e6c9;">Khuyến mãi hợp lệ</td>`;
            tbody.appendChild(trHeader);

            validData.forEach(promo => {
                const tr = createPromoRow(promo, false);
                tbody.appendChild(tr);
            });
        }

        // Khuyến mãi không hợp lệ
        if (invalidData.length > 0) {
            const trHeader = document.createElement("tr");
            trHeader.innerHTML = `<td colspan="6" class="text-start fw-bold p-2" style="background-color:#f0f0f0; border-bottom:1px solid #dcdcdc;">Khuyến mãi chưa đủ điều kiện</td>`;
            tbody.appendChild(trHeader);

            invalidData.forEach(promo => {
                const tr = createPromoRow(promo, true, orderTotal);
                tbody.appendChild(tr);
            });
        }

        function createPromoRow(promo, disabled, currentOrderTotal = 0) {
            const promoCode = promo.promotionCode || '-';
            const minOrderAmount = (promo.minOrderAmount != null && promo.minOrderAmount > 0)
                ? promo.minOrderAmount.toLocaleString('vi-VN') + 'đ'
                : '-';

            const description = promo.description || '-';
            const discountValue = promo.discountValue != null
                ? (promo.discountType === 0
                    ? promo.discountValue + '%'
                    : promo.discountValue.toLocaleString('vi-VN') + 'đ')
                : '-';
            const endDate = promo.endDate
                ? new Date(promo.endDate).toLocaleDateString('vi-VN')
                : '-';

            const tr = document.createElement("tr");
            tr.style.backgroundColor = disabled ? '#f8f9fa' : '#ffffff';
            tr.classList.toggle("text-muted", disabled);

            let tooltip = '';
            if (disabled && promo.minOrderAmount) {
                tooltip = `Đơn hàng chưa đủ ${promo.minOrderAmount.toLocaleString('vi-VN')}đ`;
                tr.setAttribute('title', tooltip);
            }

            tr.innerHTML = `
                <td class="align-middle text-center">
                    <input type="radio" name="promotion" value="${promo.promotionId || ''}" class="form-check-input" ${disabled ? 'disabled' : ''} ${tooltip ? `title="${tooltip}"` : ''}>
                </td>
                <td>${promoCode}</td>
                <td>${description}</td>
                <td>${minOrderAmount}</td>
                <td>${discountValue}</td>
                <td>${endDate}</td>
            `;

            if (!disabled) {
                const radio = tr.querySelector('input[name="promotion"]');

                if (selectedPromotionId && selectedPromotionId.toString() === (promo.promotionId || '').toString()) {
                    radio.checked = true;
                }

                radio.addEventListener('click', function () {
                    if (radio.value === selectedPromotionId) {
                        radio.checked = false;
                        selectedPromotionId = null;
                    } else {
                        selectedPromotionId = radio.value;
                    }
                });
            }

            return tr;
        }

    } catch (err) {
        console.error("Lỗi khi lấy khuyến mãi:", err);
        const tbody = document.getElementById("promotionTableBody");
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Lỗi khi tải khuyến mãi</td></tr>`;
    }
});

function applyPromotion() {
    if (!selectedPromotionId) {
        document.getElementById('selectedPromotionInput').value = '';
        document.getElementById('selectedPromotionText').innerText = '';
    } else {
        const selectedRadio = document.querySelector(`#promotionTableBody input[name="promotion"][value="${selectedPromotionId}"]`);
        const tr = selectedRadio.closest('tr');
        const promoCode = tr.children[1].innerText;
        const discountValue = tr.children[4].innerText;

        document.getElementById('selectedPromotionInput').value = `${promoCode} - ${discountValue}`;
        document.getElementById('selectedPromotionText').innerText = `Khuyến mãi: ${promoCode} - ${discountValue}`;

        localStorage.setItem("selectedPromotion", JSON.stringify({
            promoCode: promoCode,
            discountValue: discountValue
        }));
    }

    const modalEl = document.getElementById('promotionModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    updatePaymentInfo();
}


// --------------------------------------------------------------------Thanh toán-------------
// Hủy thanh toán
function resetOrderForm() {
    localStorage.clear();
    renderCart();
    updatePaymentInfo();

    const phoneInputEl = document.getElementById("customerPhoneInput");
    const customerInfoEl = document.getElementById("customerInfo");
    phoneInputEl.value = "";
    customerInfoEl.innerText = "";
    suggestions = [];
    currentIndex = -1;
    suggestionBox.style.display = "none";

    window.selectedCustomerId = null;

    selectedPromotionId = null;
    document.getElementById('selectedPromotionInput').value = '';
    document.getElementById('selectedPromotionText').innerText = '';

    document.querySelectorAll(".payment-content input, .payment-content select, .payment-content textarea").forEach(el => {
        if (el.type === "checkbox" || el.type === "radio") {
            el.checked = false;
        } else {
            el.value = '';
        }
    });

    const addCustomerForm = document.getElementById("addCustomerForm");
    if (addCustomerForm) addCustomerForm.reset();

    if (isCameraOn && scannerInstance) {
        scannerInstance.clear().then(() => {
            document.getElementById("reader").innerHTML = "";
        }).catch(err => console.error("Lỗi khi tắt scanner:", err));
        isCameraOn = false;
        const toggleBtn = document.getElementById("toggleScannerBtn");
        toggleBtn.classList.remove("btn-danger");
        toggleBtn.classList.add("btn-outline-primary");
        toggleBtn.innerHTML = `<i class="bi bi-upc-scan"></i>`;
    }

    Swal.fire({
        icon: 'info',
        title: 'Đã hủy',
        text: 'Đã hủy thanh toán',
        timer: 1800,
        showConfirmButton: false
    });
}
// Nút Hủy bên ngoài
document.querySelector(".btn-payment-cancel").addEventListener("click", resetOrderForm);

const paymentBtn = document.getElementById("btn-payment");
const phoneInputEl = document.getElementById("customerPhoneInput");
const paymentModalEl = document.getElementById('paymentModal');

paymentBtn.addEventListener("click", (e) => {
    const phoneVal = phoneInputEl.value.trim();
    if (window.selectedCustomerId == null) {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa chọn khách hàng',
            text: 'Vui lòng chọn khách hàng trước khi thanh toán.',
            confirmButtonColor: '#198754'
        });
        return;
    }

    const modal = new bootstrap.Modal(paymentModalEl);
    modal.show();

    showPaymentOption('Cash');
});

// Hiện nội dung phương thức thanh toán
function showPaymentOption(optionId) {
    document.querySelectorAll('.payment-content').forEach(el => el.classList.add('d-none'));
    const contentEl = document.getElementById(optionId);
    if (contentEl) contentEl.classList.remove('d-none');

    document.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active'));
    const btn = document.querySelector(`.list-group-item[onclick="showPaymentOption('${optionId}')"]`);
    if (btn) btn.classList.add('active');

    updatePaymentContent(optionId);
}

// Hiển thị nội dung từng loại thanh toán
function updatePaymentContent(optionId) {
    const cart = getCart();
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discount = getDiscountAmount();
    const finalAmount = total - discount;
    const amountText = finalAmount.toLocaleString('vi-VN') + 'đ';

    const customerId = window.selectedCustomerId;
    const currentUserId = parseInt(document.getElementById("userId").dataset.userId);

    if (optionId === "Cash") {
        document.getElementById("piTotalAmountCash").innerText = total.toLocaleString('vi-VN') + 'đ';
        document.getElementById("piDiscountCash").innerText = '-' + discount.toLocaleString('vi-VN') + 'đ';
        document.getElementById("piFinalCash").innerText = amountText;
    }

    if (optionId === "EWallet") {
        document.getElementById("paymentLoading").classList.remove("d-none");
        const input = {
            CustomerId: customerId,
            UserId: currentUserId,
            PromoId: selectedPromotionId ? parseInt(selectedPromotionId) : null,
            TotalAmount: total,
            DiscountAmount: discount,
            OrderStatus: 0, // pending
            PaymentMethod: 3, // E-Wallet
            OrderItems: cart.map(p => ({
                ProductId: parseInt(p.productId),
                Quantity: parseInt(p.quantity),
                Price: parseFloat(p.price)
            }))
        };

        // Gửi request tạo hóa đơn
        fetch("/OrderStaff/AddOrder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input)
        })
            .then(res => res.json())
            .then(order => {
                const orderId = order.orderId;
                const amount = finalAmount;
                const orderInfo = "Thanh toan don hang " + orderId;

                // Gọi tiếp sang MoMo backend
                fetch(`/momo-payment?orderId=${orderId}&amount=${amount}&orderInfo=${encodeURIComponent(orderInfo)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.paymentUrl) {
                            window.location.href = data.paymentUrl; // redirect đến MoMo
                        }
                    });
            });
    }

    if (optionId === "BankTransfer") {
        document.getElementById("paymentLoading").classList.remove("d-none");
        // 1. Gửi yêu cầu tạo đơn hàng pending
        const input = {
            CustomerId: customerId,
            UserId: currentUserId,
            PromoId: selectedPromotionId ? parseInt(selectedPromotionId) : null,
            TotalAmount: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
            DiscountAmount: discount,
            OrderStatus: 0, // pending
            PaymentMethod: 2, // VNPay
            OrderItems: cart.map(p => ({
                ProductId: parseInt(p.productId),
                Quantity: parseInt(p.quantity),
                Price: parseFloat(p.price)
            }))
        };

        fetch("/OrderStaff/AddOrder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input)
        })
            .then(res => res.json())
            .then(order => {
                if (order.success) {
                    const orderId = order.orderId;
                    const amount = finalAmount;
                    const orderInfo = "Thanh toán đơn hàng " + orderId;

                    // 2. Gọi tiếp sang backend tạo URL VNPay
                    fetch(`/OrderStaff/VNPayPaymentUrl?orderId=${orderId}&amount=${amount}&orderInfo=${encodeURIComponent(orderInfo)}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.paymentUrl) {
                                window.location.href = data.paymentUrl; // Redirect sang cổng thanh toán
                            } else {
                                Swal.fire("Lỗi", "Không tạo được link thanh toán VNPay", "error");
                            }
                        });
                } else {
                    Swal.fire("Lỗi", order.message, "error");
                }
            })
            .catch(err => console.error("Lỗi khi tạo đơn hàng:", err));
    }
}

// Lấy giảm giá hiện tại
function getDiscountAmount() {
    const discountText = document.getElementById("discountAmount").innerText.replace(/[^\d]/g, '');
    return parseInt(discountText) || 0;
}

// Các nút xác nhận thanh toán
$(document).on("click", "#btnConfirmCash, #btnConfirmWallet, #btnConfirmCard, #btnConfirmBank", async function () {
    const method = this.id.replace("btnConfirm", "");
    await confirmPayment(method);
});

function onlyDigits(s) { return (s || '').replace(/\D/g, ''); }

function isExpiryValid(mmYY) {
    if (!/^\d{2}\/\d{2}$/.test(mmYY)) return false;
    const [mmStr, yyStr] = mmYY.split('/');
    const mm = parseInt(mmStr, 10), yy = parseInt(yyStr, 10);
    if (mm < 1 || mm > 12) return false;
    const fullYear = 2000 + yy;
    // first day of month after expiry
    const expiryNext = new Date(fullYear, mm, 1);
    const today = new Date();
    // compare by date (set today's midnight)
    const todayCompare = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return expiryNext > todayCompare;
}

/* ----- Elements ----- */
const cardNumberInput = document.getElementById('cardNumber');
const cardExpiryInput = document.getElementById('cardExpiry');
const cardCvvInput = document.getElementById('cardCvv');

const cardNumberError = document.getElementById('cardNumberError');
const cardExpiryError = document.getElementById('cardExpiryError');
const cardCvvError = document.getElementById('cardCvvError');

const btnConfirmCard = document.getElementById('btnConfirmCard');

/* ----- Auto-format số thẻ ----- */
if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
        const raw = onlyDigits(cardNumberInput.value).slice(0, 19); // max 19 digits
        // group 4
        const parts = [];
        for (let i = 0; i < raw.length; i += 4) parts.push(raw.substr(i, 4));
        const formatted = parts.join(' ');
        cardNumberInput.value = formatted;
        // remove error state while typing
        cardNumberInput.classList.remove('is-invalid');
        cardNumberError.textContent = '';
    });
}

/* ----- Auto-format expiry MM/YY ----- */
if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
        let v = onlyDigits(cardExpiryInput.value).slice(0, 4);
        if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
        cardExpiryInput.value = v;
        cardExpiryInput.classList.remove('is-invalid');
        cardExpiryError.textContent = '';
    });
}

/* ----- CVV input clean ----- */
if (cardCvvInput) {
    cardCvvInput.addEventListener('input', () => {
        cardCvvInput.value = onlyDigits(cardCvvInput.value).slice(0, 4);
        cardCvvInput.classList.remove('is-invalid');
        cardCvvError.textContent = '';
    });
}
function validateCard() {
    // reset
    [cardNumberInput, cardExpiryInput, cardCvvInput].forEach(i => i && i.classList.remove('is-invalid'));
    cardNumberError.textContent = '';
    cardExpiryError.textContent = '';
    cardCvvError.textContent = '';

    const rawNumber = onlyDigits(cardNumberInput.value || '');
    const expiry = (cardExpiryInput.value || '').trim();
    const cvv = (cardCvvInput.value || '').trim();

    // card number
    if (!rawNumber) {
        cardNumberError.textContent = 'Vui lòng nhập số thẻ.';
        cardNumberInput.classList.add('is-invalid');
        cardNumberInput.focus();
        return false;
    }
    if (rawNumber.length < 13 || rawNumber.length > 19) {
        cardNumberError.textContent = 'Số thẻ phải có từ 13 đến 19 chữ số.';
        cardNumberInput.classList.add('is-invalid');
        cardNumberInput.focus();
        return false;
    }

    // expiry
    if (!expiry) {
        cardExpiryError.textContent = 'Vui lòng nhập ngày hết hạn (MM/YY).';
        cardExpiryInput.classList.add('is-invalid');
        cardExpiryInput.focus();
        return false;
    }
    if (!isExpiryValid(expiry)) {
        cardExpiryError.textContent = 'Ngày hết hạn không hợp lệ hoặc đã hết hạn.';
        cardExpiryInput.classList.add('is-invalid');
        cardExpiryInput.focus();
        return false;
    }

    // cvv
    if (!cvv) {
        cardCvvError.textContent = 'Vui lòng nhập CVV.';
        cardCvvInput.classList.add('is-invalid');
        cardCvvInput.focus();
        return false;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
        cardCvvError.textContent = 'CVV phải gồm 3 hoặc 4 chữ số.';
        cardCvvInput.classList.add('is-invalid');
        cardCvvInput.focus();
        return false;
    }

    // all ok
    return { cardNumber: rawNumber, expiry, cvv };
}

// Xác nhận thanh toán (gọi API AddOrder)
async function confirmPayment(method) {
    const customerId = window.selectedCustomerId;  
    const currentUserId = parseInt(document.getElementById("userId").dataset.userId);
    const cart = getCart();

    if (!customerId || cart.length === 0) {
        Swal.fire("Lỗi", "Chưa chọn khách hàng hoặc giỏ hàng trống!", "error");
        return;
    }

    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discount = getDiscountAmount();
    const finalAmount = total - discount;

    // Gán giá trị theo method
    let paymentMethod;
    switch (method) {
        case 'Cash': paymentMethod = 0; break;
        case 'Card': paymentMethod = 1; break;
        case 'BankTransfer': paymentMethod = 2; break;
        case 'EWallet': paymentMethod = 3; break;
        default: paymentMethod = -1;
    }

    const input = {
        CustomerId: customerId,
        UserId: currentUserId,
        PromoId: selectedPromotionId ? parseInt(selectedPromotionId) : null,
        TotalAmount: total,
        DiscountAmount: discount,
        OrderStatus: 1,
        PaymentMethod: paymentMethod,
        OrderItems: cart.map(p => ({
            ProductId: parseInt(p.productId),
            Quantity: parseInt(p.quantity),
            Price: parseFloat(p.price)  
        }))
    };
    console.log(input);

    if (paymentMethod == 1) {
        if(validateCard()==false) return;
    }
    // 🟢 Nếu không phải ví điện tử → xử lý như cũ
    const response = await fetch("/OrderStaff/AddOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
    });

    const result = await response.json();
    if (result.success) {
        Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Thanh toán đơn hàng thành công!',
            timer: 1800,
            showConfirmButton: false
        });
        await new Promise(resolve => setTimeout(resolve, 1800));
        localStorage.clear();
        location.reload();
        const modalEl = document.getElementById('paymentModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
    } else {
        Swal.fire("Lỗi", result.message, "error");
    }
}















