// script.js
const API_NEW_ARRIVALS = 'API_URL_NEW_ARRIVALS';
const API_HIGH_RATED = 'API_URL_HIGH_RATED';

// 1. ฟังก์ชันโหลด Header
async function loadHeader() {
    try {
        const response = await fetch('header.html');
        const html = await response.text();
        document.getElementById('header-container').innerHTML = html;
        
        // เมื่อโหลดเสร็จแล้ว ให้เปิดใช้งานปุ่มต่างๆ ทันที
        initializeHeaderComponents();
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// 2. ฟังก์ชันควบคุม UI ใน Header (Login & Search)
function initializeHeaderComponents() {
    const loginIcon = document.querySelector('.user-icon');
    const loginModal = document.getElementById('loginModal');
    const searchBox = document.querySelector('.header-search-box');
    const searchModal = document.getElementById('searchModal');
    const clearBtn = document.querySelector('.btn-clear');

    // เปิด Login Modal
    if (loginIcon && loginModal) {
        loginIcon.addEventListener('click', function (e) {
            e.preventDefault();
            loginModal.style.display = 'flex';
        });
    }

    // เปิด Search Modal
    if (searchBox && searchModal) {
        searchBox.addEventListener('click', function (e) {
            e.preventDefault();
            searchModal.style.display = 'flex'; 
        });
    }

    // คลิกพื้นที่ว่างเพื่อปิด Modal
    window.addEventListener('click', function (e) {
        if (searchModal && e.target === searchModal) searchModal.style.display = 'none';
        if (loginModal && e.target === loginModal) loginModal.style.display = 'none';
    });

    // ปุ่ม Clear ในหน้าค้นหา
    if (clearBtn && searchModal) {
        clearBtn.addEventListener('click', function (e) {
            e.preventDefault();
            searchModal.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
            searchModal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            searchModal.querySelectorAll('.star').forEach(star => star.classList.remove('selected'));
        });
    }

    // ระบบดาวในหน้าค้นหา
    if (searchModal) {
        const stars = searchModal.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = star.getAttribute('data-value');
                stars.forEach(s => {
                    if (s.getAttribute('data-value') <= value) s.classList.add('selected');
                    else s.classList.remove('selected');
                });
            });
            star.addEventListener('mouseover', () => {
                const value = star.getAttribute('data-value');
                stars.forEach(s => {
                    if (s.getAttribute('data-value') <= value) s.classList.add('hovered');
                    else s.classList.remove('hovered');
                });
            });
            star.addEventListener('mouseout', () => {
                stars.forEach(s => s.classList.remove('hovered'));
            });
        });
    }
}

// 3. ฟังก์ชันหน้า Index (สร้างดาวและดึงสินค้า)
function generateStars(rating) {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    if (fullStars > 0) starsHTML += `<span class="stars-filled">${'&#9733;'.repeat(fullStars)}</span>`;
    if (emptyStars > 0) starsHTML += `<span class="stars-empty">${'&#9733;'.repeat(emptyStars)}</span>`;
    return starsHTML;
}

async function fetchAndRenderProducts(apiUrl, containerId) {
    const container = document.getElementById(containerId);
    try {
        const products = [
            { id: 1, brand: "BRAND API 1", name: "Product loaded from API 1", price: 1580.00, rating: 5.0, imageUrl: "https://via.placeholder.com/200x200?text=Product+1" },
            { id: 2, brand: "BRAND API 2", name: "Product loaded from API 2", price: 199.00, rating: 4.0, imageUrl: "https://via.placeholder.com/200x200?text=Product+2" },
            { id: 3, brand: "BRAND API 3", name: "Product loaded from API 3", price: 59.00, rating: 4.5, imageUrl: "https://via.placeholder.com/200x200?text=Product+3" }
        ];

        container.innerHTML = '';
        products.forEach(product => {
            const productCard = `
                <div class="product-card">
                    <div class="product-image"><img src="${product.imageUrl}" alt="${product.name}"></div>
                    <div class="product-info">
                        <div class="product-brand">${product.brand}</div>
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">฿ ${product.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div class="product-footer">
                        <div class="product-rating">
                            ${generateStars(product.rating)}
                            <span class="rating-score">${product.rating.toFixed(1)}</span>
                        </div>
                        <button class="btn-cart">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        </button>
                    </div>
                </div>`;
            container.innerHTML += productCard;
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        container.innerHTML = '<p style="color: red; font-size: 18px;">ไม่สามารถดึงข้อมูลสินค้าได้</p>';
    }
}

// 4. จุดเริ่มต้นการทำงาน
document.addEventListener('DOMContentLoaded', () => {
    // โหลด Header เสมอ ไม่ว่าจะอยู่หน้าไหน
    loadHeader();

    // ถ้าอยู่หน้า index.html (มีกล่องรับสินค้า) ให้โหลดสินค้า
    if (document.getElementById('new-arrivals-container')) {
        fetchAndRenderProducts(API_NEW_ARRIVALS, 'new-arrivals-container');
        fetchAndRenderProducts(API_HIGH_RATED, 'high-rated-container');
    }

    // ถ้าอยู่หน้า search.html (มีกล่อง Dropdown) ให้ทำงานส่วน Dropdown
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
                selectedText.textContent = this.textContent;
                optionItems.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                dropdownOptions.classList.remove('open');
            });
        });

        window.addEventListener('click', function () {
            dropdownOptions.classList.remove('open');
        });
    }
});

async function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return; // ถ้าหน้านั้นไม่มีที่ใส่ Sidebar ก็ไม่ต้องโหลด

    try {
        const response = await fetch('sidebar.html');
        const html = await response.text();
        sidebarContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading sidebar:', error);
    }
}

//call loadSidebar
async function loadHeader() {
    try {
        const response = await fetch('header.html');
        const html = await response.text();
        document.getElementById('header-container').innerHTML = html;
        initializeHeaderComponents();
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadSidebar(); // เพิ่มบรรทัดนี้เพื่อโหลด Sidebar ทุกหน้า

    if (document.getElementById('new-arrivals-container')) {
        fetchAndRenderProducts(API_NEW_ARRIVALS, 'new-arrivals-container');
        fetchAndRenderProducts(API_HIGH_RATED, 'high-rated-container');
    }
    
    // ... (ส่วนควบคุม Dropdown ในหน้า Search คงเดิม) ...
});