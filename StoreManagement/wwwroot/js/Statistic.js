// Lấy context
const ctx = document.getElementById('myChart').getContext('2d');
const ctxtop = document.getElementById('myChartTop').getContext('2d');

// BIỂU ĐỒ ĐƯỜNG 
new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
        datasets: [
            // {
            //   label: 'Chi phí',
            //   data: [12, 15, 10, 8, 9, 14],
            //   borderColor: 'rgba(255, 99, 132, 1)',
            //   backgroundColor: 'rgba(255, 99, 132, 0.2)',
            //   tension: 0.3,
            //   borderWidth: 2,
            //   fill: true
            // },
            {
                label: 'Doanh thu',
                data: [18, 20, 22, 19, 25, 28],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.3,
                borderWidth: 2,
                fill: true
            },
            // {
            //   label: 'Lợi nhuận',
            //   data: [6, 5, 12, 11, 16, 14],
            //   borderColor: 'rgba(75, 192, 192, 1)',
            //   backgroundColor: 'rgba(75, 192, 192, 0.2)',
            //   tension: 0.3,
            //   borderWidth: 2,
            //   fill: true
            // }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: 'Biểu đồ doanh thu',
                font: { size: 16, weight: 'bold' }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Giá trị (triệu VNĐ)',
                    font: { size: 14, weight: 'bold' }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Thời gian (tháng)',
                    font: { size: 14, weight: 'bold' }
                }
            }
        }
    }
});

// BIỂU ĐỒ TRÒN (TOP) 

const dataTop = {
    labels: ['Sách A', 'Sách B', 'Sách C', 'Sách D', 'Sách E'],
    datasets: [{
        data: [120, 90, 70, 50, 40],
        backgroundColor: [
            'rgba(0, 191, 255, 0.9)',
            'rgba(64, 224, 208, 0.9)',
            'rgba(255, 215, 0, 0.9)',
            'rgba(255, 165, 0, 0.9)',
            'rgba(148, 0, 211, 0.9)'
        ],
        borderColor: '#fff',
        borderWidth: 2
    }]
};

new Chart(ctxtop, {
    type: 'doughnut',
    data: dataTop,
    options: {
        responsive: true,
        cutout: '65%',
        plugins: {
            legend: { position: 'top' },

        }
    }
});
