const cartBody = document.getElementById("cart-body");
let scannerInstance = null; 
let isCameraOn = false;     

const toggleBtn = document.getElementById("toggleScannerBtn");

toggleBtn.addEventListener("click", () => {
  if (!isCameraOn) {
    // Bật
    scannerInstance = new Html5QrcodeScanner('reader', { 
      qrbox: { width: 250, height: 250 },
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

  // Data mẫu để quét barcode
  const fakeProducts = {
    "3122410276": { name: "Áo thun Quỳnh Hương", price: 150000 },
    "9786048817077": { name: "kakaka", price: 320000 },
    "5558882222": { name: "Áo khoác hoodie", price: 280000 },
    "1112223334": { name: "Giày sneaker trắng", price: 450000 }
  };

  const product = fakeProducts[result.trim()] || {
    name: "Sản phẩm không xác định (" + result + ")",
    price: 100000
  };

  addToCart(result.trim(), product.name, product.price);
}

function error(err) {
  console.error("Lỗi khi quét:", err);
}

// Click chọn card
document.querySelectorAll(".product-card").forEach(card => {
  card.addEventListener("click", () => {
    const id = card.dataset.id || card.querySelector("p").innerText; // ID giả nếu chưa có
    const name = card.querySelector("p").innerText;
    const price = parseInt(card.querySelector(".product-price").innerText.replace(/\D/g, ""));

    addToCart(id, name, price);

    // Hiệu ứng đánh dấu sản phẩm đã chọn
    card.classList.add("selected");
    setTimeout(() => card.classList.remove("selected"), 300);
  });
});

// addToCart
function addToCart(id, name, price) {
  let existingRow = [...cartBody.querySelectorAll("tr")].find(row => row.dataset.id === id);

  if (existingRow) {
    let qtyInput = existingRow.querySelector(".qty-input");
    qtyInput.value = parseInt(qtyInput.value) + 1;
    updateRowTotal(existingRow, price);
  } else {
    let row = document.createElement("tr");
    row.dataset.id = id;
    row.innerHTML = `
      <td><button class="btn btn-sm btn-danger btn-remove">&times;</button></td>
      <td>${name}</td>
      <td>${price.toLocaleString()} đ</td>
      <td>
        <div class="d-flex justify-content-center align-items-center">
          <div class="input-group input-group-sm" style="width:auto;">
              <button class="btn btn-outline-primary btn-minus">-</button>
              <input type="text" class="form-control text-center qty-input" value="1" style="max-width:50px">
              <button class="btn btn-outline-primary btn-plus">+</button>
          </div>
        </div>
      </td>
      <td class="row-total">${price.toLocaleString()} đ</td>
    `;
    cartBody.appendChild(row);
  }
}

// Nút xóa với tăng giảm input số lượng
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("btn-remove")) {
    e.target.closest("tr").remove();
  }
  if (e.target.classList.contains("btn-plus") || e.target.classList.contains("btn-minus")) {
    let row = e.target.closest("tr");
    let qtyInput = row.querySelector(".qty-input");
    let price = parseInt(row.querySelector("td:nth-child(3)").innerText.replace(/\D/g, ""));
    let qty = parseInt(qtyInput.value);

    if (e.target.classList.contains("btn-plus")) qty++;
    if (e.target.classList.contains("btn-minus") && qty > 1) qty--;

    qtyInput.value = qty;
    updateRowTotal(row, price);
  }
});

// Cập nhật tạm thời khi nhập
document.addEventListener("input", function(e) {
  if (e.target.classList.contains("qty-input")) {
    let row = e.target.closest("tr");
    let price = parseInt(row.querySelector("td:nth-child(3)").innerText.replace(/\D/g, ""));
    let qty = parseInt(e.target.value);

    if (!isNaN(qty) && qty > 0) {
      updateRowTotal(row, price);
    }
  }
});

// Validate khi thoát khỏi ô input
document.addEventListener("blur", function(e) {
  if (e.target.classList.contains("qty-input")) {
    validateQty(e.target);
  }
}, true);

// Validate khi nhấn Enter
document.addEventListener("keydown", function(e) {
  if (e.target.classList.contains("qty-input") && e.key === "Enter") {
    e.preventDefault(); 
    validateQty(e.target);
    e.target.blur(); 
  }
});

// Hàm validate dùng chung
function validateQty(input) {
  let row = input.closest("tr");
  let price = parseInt(row.querySelector("td:nth-child(3)").innerText.replace(/\D/g, ""));
  let qty = parseInt(input.value);

  if (isNaN(qty) || qty <= 0) {
    showAlert("Số lượng không hợp lệ!", "error");
    input.value = 1;
  }
  updateRowTotal(row, price);
}


function updateRowTotal(row, price) {
  let qty = parseInt(row.querySelector(".qty-input").value);
  row.querySelector(".row-total").innerText = (price * qty).toLocaleString() + " đ";
}

// Lấy tất cả button trong nhóm
document.querySelectorAll("#paymentMethodButtons button").forEach(btn => {
    btn.addEventListener("click", function() {
        // Xóa active ở tất cả button
        document.querySelectorAll("#paymentMethodButtons button").forEach(b => b.classList.remove("active"));
        // Thêm active cho button vừa click
        this.classList.add("active");

        // Ẩn tất cả form
        document.querySelectorAll(".payment-form").forEach(f => f.classList.add("d-none"));
        // Hiện form tương ứng
        let method = this.dataset.method;
        document.getElementById("payment-" + method).classList.remove("d-none");
    });
});
// Modal thanh toán
function showPaymentOption(optionId) {
  // Ẩn tất cả nội dung
  document.querySelectorAll('.payment-content').forEach(el => el.classList.add('d-none'));
  // Hiện phần tương ứng
  document.getElementById(optionId).classList.remove('d-none');

  // Làm nổi bật nút được chọn
  document.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active'));
  event.target.classList.add('active');
}
function confirmCashPayment() {
    // Đóng modal trước
    const modalElement = document.getElementById('paymentModal');
    const modal = bootstrap.Modal.getInstance(modalElement); // Lấy instance modal đang mở
    modal.hide();

    // Hiển thị thông báo thành công
    Swal.fire({
      title: "Thanh toán thành công!",
      text: "Bạn đã thanh toán tiền mặt (COD) thành công.",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#198754"
    });
  }



