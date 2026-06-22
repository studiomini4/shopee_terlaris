// URL dari CSV Google Sheets Anda
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwRYel94cUe9przoVOURDHLMtfOhSB0m4rAAO-kYZjp2a1KAIhXFSbYqtImttg5Yv_L7D49I-rD6jl/pub?gid=1097372486&single=true&output=csv';
let daftarProduk = [];

// KONFIGURASI PAGINATION
let currentPage = 1;
const itemsPerPage = 8; 

// FUNGSI MENGACAK URUTAN
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// FUNGSI MEMBUAT TAB OTOMATIS
function buatTabOtomatis() {
    const tabNav = document.getElementById('tabNav');
    if (!tabNav) return;
    
    // Ambil kategori unik dari data, tambahkan 'semua' di awal
    const kategoriUnik = ['semua', ...new Set(daftarProduk.map(p => p.kategori.toLowerCase().trim()))];
    
    tabNav.innerHTML = ''; // Kosongkan tab sebelum diisi ulang
    
    kategoriUnik.forEach(kat => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${kat === 'semua' ? 'active' : ''}`;
        btn.innerText = kat.charAt(0).toUpperCase() + kat.slice(1);
        btn.onclick = function() { filterProduk(kat, this); };
        tabNav.appendChild(btn);
    });
}

// FUNGSI UNTUK MENGAMBIL DATA
async function fetchProduk() {
    try {
        const response = await fetch(CSV_URL);
        const data = await response.text();
        const rows = data.split(/\r?\n/).slice(1); 
        
        daftarProduk = rows
            .filter(row => row.trim() !== "")
            .map(row => {
                const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
                const parts = row.split(regex).map(item => item.replace(/^"|"$/g, '').trim());
                return { 
                    kategori: parts[0], 
                    judul: parts[1], 
                    terjual: parts[2], 
                    gambar: parts[3], 
                    link: parts[4] 
                };
            });
        
        shuffleArray(daftarProduk); // Acak produk
        buatTabOtomatis();          // Buat tab otomatis
        tampilkanProduk(); 
    } catch (error) {
        console.error("Gagal mengambil data:", error);
    }
}

// FUNGSI UNTUK MENAMPILKAN PRODUK DENGAN PAGINATION
function tampilkanProduk(filter = 'semua', page = 1) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    currentPage = page;
    
    const produkFiltered = filter === 'semua' ? daftarProduk : daftarProduk.filter(p => p.kategori && p.kategori.toLowerCase().trim() === filter.toLowerCase());
    
    // Logika Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = produkFiltered.slice(startIndex, endIndex);
    
    paginatedItems.forEach(p => {
        if (!p.judul) return;
        grid.innerHTML += `
            <div class="card">
                <img src="${p.gambar}" alt="${p.judul}" loading="lazy">
                <div class="content">
                    <div class="title">${p.judul}</div>
                    <div class="sold-info">🔥 Terjual ${p.terjual || '0'}</div>
                    <a href="${p.link}" target="_blank" class="btn-shopee">Beli Sekarang</a>
                </div>
            </div>
        `;
    });

    renderPagination(produkFiltered.length, filter);
}

// FUNGSI MEMBUAT TOMBOL HALAMAN
function renderPagination(totalItems, filter) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return;

    let paginationHtml = '<div style="grid-column: 1/-1; text-align: center; margin: 20px 0;">';
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHtml += `<button onclick="tampilkanProduk('${filter}', ${i})" class="tab-btn ${activeClass}" style="padding: 5px 15px; margin: 2px;">${i}</button>`;
    }
    paginationHtml += '</div>';
    document.getElementById('productGrid').innerHTML += paginationHtml;
}

// FUNGSI FILTER TAB
function filterProduk(kat, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tampilkanProduk(kat, 1);
}

// JALANKAN SAAT STARTUP
document.addEventListener('DOMContentLoaded', () => {
    fetchProduk();
});