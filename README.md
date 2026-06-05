# ARIS (AI-Powered Review Intelligence System)

ARIS adalah sistem berbasis kecerdasan buatan yang dirancang untuk menganalisis ulasan produk Tokopedia secara otomatis. Sistem ini berfokus pada produk-produk ramah lingkungan (Sustainable Living & Responsible Consumption) untuk mendeteksi sentimen ulasan, mengidentifikasi review mencurigakan/spam, menghitung skor kepercayaan (Trust Score), serta menyertakan tingkat keyakinan (Confidence Level) dari hasil prediksi model.

Proyek ini menggunakan arsitektur terintegrasi di mana modul Express.js Backend langsung mengeksekusi skrip Python (`aris_scraper_api.py`) untuk kebutuhan scraping dan analisis data.

---

## Struktur Repositori Utama

/

* SCRAP/ -> Notebook penelitian awal dan pipeline pengumpulan data mandiri.
* backend/ -> Express.js server backend sekaligus runner untuk analisis data via aris_scraper_api.py.
* frontend/ -> React + Vite + Tailwind CSS untuk antarmuka dashboard utama.
* machine-learning/ -> Modul ML (Notebook training, berkas konfigurasi, dan model).
* .gitignore -> Konfigurasi pengabaian berkas Git.
* package.json -> Dependensi root proyek.
* README.md -> Dokumentasi utama proyek.

---

## Petunjuk Setup Environment

### 1. Prasyarat Sistem

* Node.js v18 atau versi di atasnya
* Python 3.10 atau versi di atasnya (beserta library pandas, numpy, dll.)

### 2. Environment Variables (Konfigurasi Kredensial)

Masuk ke dalam folder "backend/", salin berkas .env.example menjadi .env, kemudian isi variabel berikut:

PORT=3000
GOOGLE_CLIENT_ID=isi_client_id_oauth_anda
GOOGLE_CLIENT_SECRET=isi_client_secret_oauth_anda
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=isi_string_random_panjang_untuk_keamanan_session

---

## Cara Menjalankan Aplikasi

Buka dua terminal terpisah untuk menjalankan backend dan frontend secara bersamaan.

### Langkah 1: Jalankan Backend Server

Pastikan berkas tokopedia_cookies.json yang valid sudah diletakkan di dalam folder backend untuk kebutuhan scraping instan lewat API.

cd backend
npm install
npm run dev

### Langkah 2: Jalankan Frontend Dashboard

Buka terminal baru, lalu jalankan antarmuka dashboard visualisasi ARIS.

cd frontend
npm install
npm run dev

Setelah kedua server berjalan, buka peramban Anda dan akses tautan: http://localhost:5173

---

## Fitur Utama Sistem

* Sentiment Analysis: Mengklasifikasikan ulasan produk ke dalam kategori Positive atau Negative memanfaatkan arsitektur Machine Learning.
* Suspicious Review Detection: Mendeteksi ulasan palsu atau spam secara cerdas berdasarkan indikator duplikasi teks dan pola kalimat.
* Trust Score Calculation: Memberikan penilaian objektif terhadap kredibilitas ulasan berdasarkan parameter rating dan kualitas pesan teks.
* Google OAuth 2.0 Integration: Proses pendaftaran dan login aman yang terhubung langsung dengan sistem akun Google.
