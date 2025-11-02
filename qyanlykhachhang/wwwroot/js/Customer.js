// Customer management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('.btn-search');
    const clearButton = document.querySelector('.btn-clear');
    
    function toggleClearButton() {
        if (searchInput.value.trim() !== '') {
            clearButton.style.display = '';
        } else {
            clearButton.style.display = 'none';
        }
    }
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const tableRows = document.querySelectorAll('tbody tr');
        let visibleCount = 0;
        
        // Toggle clear button
        toggleClearButton();
        
        tableRows.forEach(row => {
            // Skip the "no results" row if it exists
            if (row.id === 'noResultsMsg') {
                return;
            }
            
            const name = row.cells[1]?.textContent.toLowerCase() || '';
            const phone = row.cells[2]?.textContent.toLowerCase() || '';
            const email = row.cells[3]?.textContent.toLowerCase() || '';
            
            if (searchTerm === '' || 
                name.includes(searchTerm) || 
                phone.includes(searchTerm) || 
                email.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Show "No results" message if needed
        let noResultsMsg = document.getElementById('noResultsMsg');
        if (visibleCount === 0 && searchTerm !== '') {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('tr');
                noResultsMsg.id = 'noResultsMsg';
                noResultsMsg.innerHTML = '<td colspan="5" class="text-center py-4 text-muted">Không tìm thấy khách hàng nào</td>';
                const tbody = document.querySelector('tbody');
                if (tbody) {
                    tbody.appendChild(noResultsMsg);
                }
            }
            noResultsMsg.style.display = '';
        } else if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }
    
    // Search button click
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            performSearch();
        });
    }
    
    // Real-time search as you type
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            performSearch();
        });
        
        // Enter key search
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
        
        // Escape key to clear
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                performSearch();
            }
        });
    }
    
    // Clear button click
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            performSearch();
            searchInput.focus();
        });
    }
    
    // Form validation
    const form = document.getElementById('customerForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            const name = document.getElementById('fullname');
            const phone = document.getElementById('phonenumber');
            const email = document.getElementById('customeremail');
            const address = document.getElementById('address');
            
            let isValid = true;
            
            // Validate name
            if (!name.value.trim()) {
                name.classList.add('is-invalid');
                isValid = false;
            } else {
                name.classList.remove('is-invalid');
            }
            
            // Validate phone
            if (!phone.value.trim()) {
                phone.classList.add('is-invalid');
                isValid = false;
            } else {
                phone.classList.remove('is-invalid');
            }
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim() || !emailRegex.test(email.value)) {
                email.classList.add('is-invalid');
                isValid = false;
            } else {
                email.classList.remove('is-invalid');
            }
            
            // Validate address
            if (!address.value.trim()) {
                address.classList.add('is-invalid');
                isValid = false;
            } else {
                address.classList.remove('is-invalid');
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // Auto-dismiss alerts after 5 seconds
    const alert = document.querySelector('.alert');
    if (alert) {
        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    }
});

