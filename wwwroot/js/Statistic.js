const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
const ctxtop = document.getElementById('myChartTop').getContext('2d');

let revenueChart;
let topChart;


async function loadRevenueByYear(year) {
    const res = await fetch(`/Statistic/GetRevenueByMonth?year=${year}`);
    const data = await res.json();

    const labels = data.map(x => `Tháng ${x.month}`);
    const values = data.map(x => x.revenue);

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctxRevenue, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Doanh thu (₫)',
                data: values,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: {
                    display: true,
                    text: `Biểu đồ doanh thu năm ${year}`,
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: { beginAtZero: true },
                x: { ticks: { font: { size: 13 } } }
            }
        }
    });
}

async function loadRevenueByRange(start, end) {
    const res = await fetch(`/Statistic/GetRevenueByRange?startDate=${start}&endDate=${end}`);
    const data = await res.json();

    if (data.error) {
        showAlert("Vui lòng chọn đủ ngày bắt đầu và kết thúc!", "warning");
        return;
    }

    const labels = data.map(x => new Date(x.date).toLocaleDateString('vi-VN'));
    const values = data.map(x => x.revenue);

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctxRevenue, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Doanh thu (₫)',
                data: values,
                borderColor: 'rgba(54, 162, 235, 1)',
                // backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                // fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: {
                    display: true,
                    text: `Doanh thu từ ${start} đến ${end}`,
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10,
                        font: { size: 11 }
                    }
                },
                y: { beginAtZero: true }
            }
        }
    });
}

// Khởi chạy khi trang load
document.addEventListener("DOMContentLoaded", function () {
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = yearSelect.value || new Date().getFullYear();
    loadRevenueByYear(currentYear);

    yearSelect.addEventListener('change', e => loadRevenueByYear(e.target.value));

    document.getElementById('filterBtn').addEventListener('click', () => {
        const start = document.getElementById('startDate').value;
        const end = document.getElementById('endDate').value;
        loadRevenueByRange(start, end);
    });
});



document.addEventListener("DOMContentLoaded", function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
});

// Biểu đồ tròn
async function loadTopChart() {
    const type = document.getElementById('topType').value;
    const limit = document.getElementById('topLimit').value || 5;
    const start = document.getElementById('startDatePie').value;
    const end = document.getElementById('endDatePie').value;

    if (parseInt(limit) > 5) {
        showAlert('Giới hạn quá lớn! Tối đa là 5', 'warning');
        return;
    }

    const query = new URLSearchParams({
        type,
        limit,
        startDate: start || '',
        endDate: end || ''
    });

    const res = await fetch(`/Statistic/GetTopData?${query}`);
    const data = await res.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    const labels = data.map(x => x.label);
    const values = data.map(x => x.value);

    if (topChart) topChart.destroy();

    topChart = new Chart(ctxtop, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(0,191,255,0.9)',
                    'rgba(64,224,208,0.9)',
                    'rgba(255,215,0,0.9)',
                    'rgba(255,165,0,0.9)',
                    'rgba(148,0,211,0.9)',
                    'rgba(255,99,132,0.9)',
                    'rgba(75,192,192,0.9)',
                    'rgba(255,159,64,0.9)',
                    'rgba(153,102,255,0.9)',
                    'rgba(54,162,235,0.9)',
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            cutout: '65%',
            animation: {
                animateScale: true,
                animateRotate: true
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 13 } }
                },
                title: {
                    display: true,
                    text: getTopTitle(type),
                    font: { size: 16, weight: 'bold' }
                }
            }
        }
    });
}

function getTopTitle(type) {
    switch (parseInt(type)) {
        case 1: return 'Top sản phẩm bán chạy nhất';
        case 2: return 'Top sản phẩm ít bán chạy nhất';
        case 3: return 'Top khách hàng chi tiêu nhiều nhất';
        case 4: return 'Top khách hàng chi tiêu ít nhất';
        default: return 'Biểu đồ TOP';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadTopChart(); // Mặc định khi vào trang

    document.getElementById('topType').addEventListener('change', loadTopChart);
    document.getElementById('topLimit').addEventListener('input', loadTopChart);
    document.getElementById('startDatePie').addEventListener('change', loadTopChart);
    document.getElementById('endDatePie').addEventListener('change', loadTopChart);
});
