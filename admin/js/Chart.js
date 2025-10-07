const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
      datasets: [
        {
          label: 'Chi phí',
          data: [12, 15, 10, 8, 9, 14],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.3,
          borderWidth: 2
        },
        {
          label: 'Doanh thu',
          data: [18, 20, 22, 19, 25, 28],
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.3,
          borderWidth: 2
        },
        {
          label: 'Lợi nhuận',
          data: [6, 5, 12, 11, 16, 14],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Giá trị (triệu VNĐ)',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Thời gian (tháng)',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        }
      }
    }
  });