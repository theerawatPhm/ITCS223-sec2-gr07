// script.js
const API_NEW_ARRIVALS = 'API_URL_NEW_ARRIVALS';
const API_HIGH_RATED = 'API_URL_HIGH_RATED';

//Load Component (Header, Sidebar, Footer, Sort)
async function loadComponent(url, containerId, callback = null) {
    const container = document.getElementById(containerId);
    if (!container) return; 
    
    try {
        const response = await fetch(url);
        const html = await response.text();
        container.innerHTML = html;
        
        if (callback) callback();
    } catch (error) {
        console.error(`Error loading ${url}:`, error);
    }
}

// 2. ฟังก์ชันตั้งค่า UI Components

// ตั้งค่า Header (Login Modal & Search Modal)
function initializeHeaderComponents() {
    const loginIcon = document.querySelector('.user-icon');
    const loginModal = document.getElementById('loginModal');
    const searchBox = document.querySelector('.header-search-box');
    const searchModal = document.getElementById('searchModal');
    const clearBtn = document.querySelector('.btn-clear');

    if (loginIcon && loginModal) {
        loginIcon.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'flex';
        });
    }

    if (searchBox && searchModal) {
        searchBox.addEventListener('click', (e) => {
            e.preventDefault();
            searchModal.style.display = 'flex'; 
        });
    }

    //click area to close modal
    window.addEventListener('click', (e) => {
        if (searchModal && e.target === searchModal) searchModal.style.display = 'none';
        if (loginModal && e.target === loginModal) loginModal.style.display = 'none';
    });

    //clear btn
    if (clearBtn && searchModal) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            searchModal.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
            searchModal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            searchModal.querySelectorAll('.star').forEach(star => star.classList.remove('selected'));
        });
    }

    //star rating
    if (searchModal) {
        const stars = searchModal.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = star.getAttribute('data-value');
                stars.forEach(s => {
                    s.getAttribute('data-value') <= value ? s.classList.add('selected') : s.classList.remove('selected');
                });
            });
        });
    }
}

//Sort Dropdown
function initializeSortDropdown() {
    const dropdownTrigger = document.querySelector('.dropdown-trigger');
    const dropdownOptions = document.querySelector('.dropdown-options');
    const selectedText = document.querySelector('.selected-text');
    const optionItems = document.querySelectorAll('.dropdown-options li');

    if (dropdownTrigger && dropdownOptions) {
        dropdownTrigger.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdownOptions.classList.toggle('open');
        });

        optionItems.forEach(item => {
            item.addEventListener('click', function () {
                const sortBy = this.getAttribute('data-value');

                selectedText.textContent = this.textContent;

                optionItems.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');

                dropdownOptions.classList.remove('open');

                const containerId = document.querySelector('.product-grid').id || 'search-result-container';
                fetchAndRenderProducts('API_URL', containerId, sortBy);
            });
        });

        window.addEventListener('click', () => dropdownOptions.classList.remove('open'));
    }
}

// 3.index page to load data
function generateStars(rating) {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    if (fullStars > 0) starsHTML += `<span class="stars-filled">${'★'.repeat(fullStars)}</span>`;
    if (emptyStars > 0) starsHTML += `<span class="stars-empty">${'★'.repeat(emptyStars)}</span>`;
    return starsHTML;
}

async function fetchAndRenderProducts(apiUrl, containerId, sortBy = 'new-arrivals') {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        //Mock Data (wait for backend)
        let products = [
            { id: 1, brand: "CALVIN KLEIN", name: "Silky Coconut Perfume Mist", price: 1580.00, rating: 5.0, date: "2024-04-10", imageUrl: "assets/img/image 3.png" },
            { id: 2, brand: "RINN", name: "Soft Blink Lashes", price: 190.00, rating: 4.5, date: "2024-04-05", imageUrl: "assets/img/image 3.png" },
            { id: 3, brand: "DCASH", name: "Max Speed Floral Colors", price: 59.00, rating: 4.0, date: "2024-03-20", imageUrl: "assets/img/image 3.png" },
            { id: 4, brand: "MAYBELLINE", name: "Volume Express Hyper Curl", price: 179.00, rating: 4.8, date: "2024-04-12", imageUrl: "assets/img/image 3.png" },
            { id: 5, brand: "3CE", name: "Velvet Lip Tint", price: 690.00, rating: 4.9, date: "2024-04-01", imageUrl: "assets/img/image 3.png" }
        ];

        //sort data function is HERE
        if (sortBy === 'price-low-high') {
            products.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high-low') {
            products.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'high-rated') {
            products.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'brand-a-z') {
            products.sort((a, b) => a.brand.localeCompare(b.brand));
        } else if (sortBy === 'brand-z-a') {
            products.sort((a, b) => b.brand.localeCompare(a.brand));
        } else {

            products.sort((a, b) => new Date(b.date) - new Date(a.date)); 
        }

        container.innerHTML = '';
        products.forEach(product => {
            container.innerHTML += `
                <div class="product-card">
                    <div class="product-image"><img src="${product.imageUrl}" alt="${product.name}"></div>
                    <div class="product-info">
                        <div class="product-brand">${product.brand}</div>
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">฿ ${product.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div class="product-footer">
                        <div class="product-rating">
                            ${generateStars(product.rating)} <span class="rating-score">${product.rating.toFixed(1)}</span>
                        </div>
                        <button class="btn-cart">🛒</button>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

//Call function
document.addEventListener('DOMContentLoaded', () => {

    loadComponent('header.html', 'header-container', initializeHeaderComponents);
    loadComponent('sidebar.html', 'sidebar-container');
    loadComponent('footer.html', 'footer-container');
    loadComponent('sort.html', 'sort-container', initializeSortDropdown);

    fetchAndRenderProducts(API_NEW_ARRIVALS, 'new-arrivals-container');
    fetchAndRenderProducts(API_HIGH_RATED, 'high-rated-container');

    fetchAndRenderProducts('API_URL', 'search-result-container', 'new-arrivals');
});