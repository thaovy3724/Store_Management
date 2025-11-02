document.addEventListener("DOMContentLoaded", function () {
    const modalTitle = document.getElementById("orderHistoryModalTitle");
    const saveBtn = document.getElementById("orderHistoryModalSaveBtn");
    const cartBody = document.getElementById("cart-body");
    const templateRow = document.querySelector(".order-item-template");

    async function showOrderDetail(orderId) {
        try {
            const res = await fetch(`${window.location.origin}/Orders/Detail/${orderId}`);
            if (!res.ok) throw new Error("HTTP error " + res.status);

            const data = await res.json();
            if (!data.success) {
                alert(data.message || "Không lấy được đơn hàng");
                return;
            }

            const order = data.viewModel;

            modalTitle.innerText = "Xem chi tiết đơn hàng";
            saveBtn.style.display = "none";

            cartBody.querySelectorAll("tr:not(.order-item-template)").forEach(tr => tr.remove());

            const orderHeader = document.querySelector(".card-header-order").innerText = `Thông tin đơn hàng #${orderId}`;
            document.querySelector(".order-history-customername").innerText = order.customerName;
            document.querySelector(".order-history-username").innerText = order.userName;
            document.querySelector(".order-history-orderdate").innerText = new Date(order.orderDate).toLocaleString();

            const statusEl = document.querySelector(".order-history-orderstatus");

            switch (order.status) {
                case 0:
                    statusEl.innerText = "Chờ xử lý";
                    statusEl.style.backgroundColor = "#ffc1071a";
                    statusEl.style.color = "#b8860b";
                    statusEl.style.border = "1px solid #ffc107";
                    break;
                case 1:
                    statusEl.innerText = "Đã thanh toán";
                    statusEl.style.backgroundColor = "#0d6efd1a";
                    statusEl.style.color = "#0d6efd";
                    statusEl.style.border = "1px solid #0d6efd";
                    break;
                case 2:
                    statusEl.innerText = "Đã hủy";
                    statusEl.style.backgroundColor = "#dc35451a";
                    statusEl.style.color = "#dc3545";
                    statusEl.style.border = "1px solid #dc3545";
                    break;
                default:
                    statusEl.innerText = "Không xác định";
                    statusEl.style.backgroundColor = "#eee";
                    statusEl.style.color = "#333";
                    statusEl.style.border = "1px solid #ccc";
                    break;
            }
            const paymentDiv = document.querySelector(".order-history-paymentmethod-div");
            const paymentDivCollapse = document.querySelector(".order-history-paymentmethod-div-collapse");
            paymentDiv.classList.add("d-none");
            paymentDivCollapse.classList.add("d-none");
            if (order.status === 1) { 
                paymentDiv.classList.remove("d-none"); 
                paymentDivCollapse.classList.remove("d-none"); 
                const paymentBtn = paymentDiv.querySelector(".btn-order-history-paymentmethod");
                let paymentText;

                switch (order.paymentMethod) {
                    case 0:
                        paymentText = "Chuyển khoản";
                        break;
                    case 1:
                        paymentText = "Thẻ";
                        break;
                    case 2:
                        paymentText = "Tiền mặt";
                        break;
                    case 3:
                        paymentText = "Ví điện tử";
                        break;
                    default:
                        paymentText = "Không xác định";
                        break;
                }

                document.querySelector(".btn-order-history-paymentmethod").innerText = paymentText;
                document.querySelector(".order-history-paymentmethod").innerText = paymentText;

                document.querySelector(".order-history-paymentamount").innerText = order.totalAmount.toLocaleString() + " đ";
                document.querySelector(".order-history-paymentdate").innerText = order.orderDate ? new Date(order.orderDate).toLocaleString() : "";
            } 

            document.querySelector(".order-history-totalamount").innerText = order.totalAmount.toLocaleString() + " đ";
            document.querySelector(".order-history-promotioncode").innerText = order.promotionCode;
            document.querySelector(".order-history-discountamount").innerText = "-" + (order.discountAmount || 0).toLocaleString() + " đ";
            document.querySelector(".order-history-finalamount").innerText = (order.finalAmount).toLocaleString() + " đ";
            document.querySelector("#orderHistoryForm .btn-print").setAttribute("data-order-id", orderId);
            order.items.forEach(item => {
                const clone = templateRow.cloneNode(true);
                clone.classList.remove("d-none", "order-item-template");
                clone.querySelector(".order-history-product-name").innerText = item.productName;
                const imgEl = clone.querySelector(".order-history-product-img img");
                imgEl.src = `/uploads/${item.productImage}`;
                imgEl.alt = item.productName;
                clone.querySelector(".order-history-product-price").innerText = item.price.toLocaleString() + " đ";
                clone.querySelector(".order-history-product-quantity").innerText = item.quantity;
                clone.querySelector(".order-history-product-subtotal").innerText = item.subTotal.toLocaleString() + " đ";
                cartBody.appendChild(clone);
            });

        } catch (err) {
            console.error("Lỗi khi tải dữ liệu đơn hàng:", err);
            alert("Đã có lỗi xảy ra khi lấy dữ liệu đơn hàng.");
        }
    }
    async function reloadButton() {
        document.querySelectorAll(".btn-view").forEach(btn => {
            btn.addEventListener("click", function () {
                const orderId = this.getAttribute("data-order-id");
                if (!orderId) return;
                showOrderDetail(orderId);
            });
        });

        // Nút in hóa đơn
        document.querySelectorAll(".btn-print").forEach(btn => {
            btn.addEventListener("click", async function () {
                const orderId = this.getAttribute("data-order-id");
                if (!orderId) return;

                try {
                    const res = await fetch(`${window.location.origin}/Orders/Detail/${orderId}`);
                    if (!res.ok) throw new Error("HTTP error " + res.status);

                    const data = await res.json();
                    if (!data.success) {
                        alert("Không lấy được đơn hàng để in");
                        return;
                    }

                    const order = data.viewModel;

                    // Trạng thái
                    let statusText;
                    switch (order.status) {
                        case 0: statusText = "Chờ xử lý"; break;
                        case 1: statusText = "Đã thanh toán"; break;
                        case 2: statusText = "Đã hủy"; break;
                        default: statusText = "Không xác định"; break;
                    }

                    // Phương thức thanh toán
                    let paymentText;
                    switch (order.paymentMethod) {
                        case 0: paymentText = "Chuyển khoản"; break;
                        case 1: paymentText = "Thẻ"; break;
                        case 2: paymentText = "Tiền mặt"; break;
                        case 3: paymentText = "Ví điện tử"; break;
                        default: paymentText = "Không xác định"; break;
                    }

                    const width = 1200;
                    const height = 800;
                    const left = (window.screen.width / 2) - (width / 2);
                    const top = (window.screen.height / 2) - (height / 2) - 100;

                    const printWindow = window.open(
                        "",
                        "PrintWindow",
                        `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=no,resizable=no`
                    );
                    printWindow.document.write(`
                <html>
                <head>
                    <title>Hóa đơn #${orderId}</title>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
                    <style>
                        body { font-family: 'Arial', sans-serif; margin: 20px; font-size: 13px; color: #333; }
                        .invoice-box { max-width: 850px; margin: auto; padding: 25px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
                        .logo { max-height: 80px; margin-bottom: 10px; }
                        .invoice-header { text-align: center; margin-bottom: 20px; }
                        .invoice-header h2 { margin-bottom: 5px; font-size: 24px; }
                        .invoice-header p { margin: 2px 0; font-size: 13px; }
                        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
                        .invoice-info div { width: 48%; }
                        .invoice-info p { margin: 3px 0; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                        table th, table td { border: 1px solid #ddd; padding: 8px; }
                        table th { background-color: #f8f9fa; font-weight: 600; }
                        td.text-right { text-align: right; font-family: monospace; }
                        tfoot td { font-weight: bold; }
                        .thank-you { text-align: center; margin-top: 25px; font-style: italic; font-size: 14px; }
                        hr { border-top: 1px dashed #bbb; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="invoice-box">
                        <div class="invoice-header">
                            <h2>StoreManagement</h2>
                            <p>Địa chỉ: 256 An Dương Vương, phường 3, quận 5, TP.HCM</p>
                            <p>Hotline: 0123 456 789</p>
                            <hr/>
                            <h4>HÓA ĐƠN BÁN HÀNG #${orderId}</h4>
                            <small>Ngày: ${new Date(order.orderDate).toLocaleString()}</small>
                        </div>

                        <div class="invoice-info">
                            <div>
                                <p><strong>Khách hàng:</strong> ${order.customerName}</p>
                                <p><strong>Nhân viên:</strong> ${order.userName}</p>
                            </div>
                            <div class="text-right">
                                <p><strong>Trạng thái:</strong> ${statusText}</p>
                                <p><strong>Phương thức thanh toán:</strong> ${order.status === 1 ? paymentText : "Chưa thanh toán"}</p>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Sản phẩm</th>
                                    <th>Đơn giá</th>
                                    <th>Số lượng</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map((item, idx) => `
                                    <tr>
                                        <td>${idx + 1}</td>
                                        <td>${item.productName}</td>
                                        <td class="text-right">${item.price.toLocaleString()} đ</td>
                                        <td class="text-right">${item.quantity}</td>
                                        <td class="text-right">${item.subTotal.toLocaleString()} đ</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" class="text-right">Tổng cộng</td>
                                    <td class="text-right">${order.totalAmount.toLocaleString()} đ</td>
                                </tr>
                                <tr>
                                    <td colspan="4" class="text-right">Khuyến mãi</td>
                                    <td class="text-right">-${(order.discountAmount || 0).toLocaleString()} đ</td>
                                </tr>
                                <tr>
                                    <td colspan="4" class="text-right">Thành tiền</td>
                                    <td class="text-right">${order.finalAmount.toLocaleString()} đ</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div class="thank-you">
                            <p>Cảm ơn quý khách đã mua hàng!</p>
                            <p>Mọi thắc mắc vui lòng liên hệ Hotline: 0123 456 789</p>
                        </div>
                    </div>
                </body>
                </html>
            `);

                    printWindow.document.close();
                    setTimeout(() => {
                        if (!printWindow.closed) {
                            printWindow.focus();
                            printWindow.print();
                            printWindow.close();
                        }
                    }, 400);

                } catch (err) {
                    console.error("Lỗi in hóa đơn:", err);
                    alert("Có lỗi xảy ra khi in hóa đơn");
                }
            });
        });
    }
    reloadButton();

    function applyFilter() {
        const status = document.querySelector(".filter-status").value;
        const priceFrom = document.querySelector(".filter-price-min").value;
        const priceTo = document.querySelector(".filter-price-max").value;
        const search = document.getElementById("filter-order-id").value.trim();

        const params = new URLSearchParams({
            page: 1,
            search: search || "",
            status: status !== "-1" ? status : "",
            priceFrom: priceFrom || "",
            priceTo: priceTo || ""
        });

        window.location.href = `/Orders/Index?${params.toString()}`;
    }

    // Bấm nút tìm kiếm
    document.getElementById("btnSearch").addEventListener("click", applyFilter);
    document.getElementById("filter-order-id").addEventListener("keypress", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            applyFilter();
        }
    });

    // Thay đổi filter
    [".filter-status", ".filter-price-min", ".filter-price-max"].forEach(filter => {
        document.querySelector(filter).addEventListener("change", applyFilter);
    });
});
