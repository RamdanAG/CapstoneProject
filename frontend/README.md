# Fullstack Project

React di depan, Express di belakang, data disimpan ke file JSON dulu biar nggak ribet setup database. Nanti kalau udah butuh bisa migrasi.

---

## Struktur folder

```
fullstack-project/
├── frontend/
└── backend/
```

---

## Cara jalanin

### Backend dulu

```bash
cd backend
npm install
cp .env.example .env
```

Buka `.env`, isi bagian ini:

```env
PORT=3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=isi_random_panjang_disini
```

**Dapetin Google Client ID + Secret:**
1. Buka [console.cloud.google.com](https://console.cloud.google.com), buat project baru
2. Masuk ke **APIs & Services → Credentials**
3. **Create Credentials → OAuth 2.0 Client ID**, pilih Web application
4. Di bagian Authorized redirect URIs tambahkan: `http://localhost:3000/auth/google/callback`
5. Copy Client ID dan Secret-nya ke `.env`

**Generate SESSION_SECRET** — jalankan ini di terminal, copy hasilnya:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Setelah `.env` beres:
```bash
npm run dev
```

---

### Lanjut frontend

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`. Backend harus sudah jalan duluan.

---

## Yang sudah bisa dilakukan

### Auth

- Daftar pakai email & password
- Login pakai email & password
- Daftar pakai Google — kalau belum pernah daftar, setelah login Google akan diarahkan ke form isi data dulu, baru akun dibuat
- Login pakai Google — kalau sudah pernah daftar, langsung masuk
- Session tahan 7 hari
- Password tidak pernah dikirim balik ke frontend, selalu di-hash pakai bcrypt

### Halaman

| Path | Akses |
|------|-------|
| `/login` | Publik, redirect ke home kalau sudah login |
| `/register` | Publik, redirect ke home kalau sudah login |
| `/` | Harus login |
| `/about` | Publik |

---

## API

### Auth

```
POST  /auth/register          → daftar manual
POST  /auth/login             → login manual
GET   /auth/me                → cek siapa yang lagi login
POST  /auth/logout            → logout
GET   /auth/google            → mulai login Google
GET   /auth/google/callback   → Google redirect ke sini setelah login
```

### Items

```
GET    /api/items         → ambil semua
GET    /api/items/:id     → ambil satu
POST   /api/items         → tambah
PUT    /api/items/:id     → update
DELETE /api/items/:id     → hapus
```

### AI

```
GET   /api/ai/ping        → cek apakah model sudah ke-load
POST  /api/ai/predict     → kirim input, dapat output model
```

---

## Penyimpanan data

Semua data disimpan di `backend/src/data/data.json`. Permanen, nggak ilang kalau server di-restart.

Kalau mau tambah "tabel" baru tinggal pakai helper yang sudah ada:

```js
import { getAll, insert, update, remove } from '../data/db.js'

getAll('products')
insert('products', { name: 'Produk A', price: 10000 })
update('products', 1, { price: 12000 })
remove('products', 1)
```

**Set user jadi admin** — buka `data.json` langsung, cari user-nya, ganti `"role": "user"` jadi `"role": "admin"`. Sengaja nggak dibuatin UI-nya biar nggak sembarangan.

---

## Model AI

Model format `.keras` (TensorFlow/Keras).

1. Taruh file model di `backend/src/ai/models/model.keras`
2. Buka `backend/src/ai/runner.py`, sesuaikan fungsi `preprocess_input()` dengan format input model kamu — misalnya gambar, teks, atau array angka
3. Jalankan backend seperti biasa, model otomatis di-load waktu server start

Cek model sudah jalan:
```bash
curl http://localhost:3000/api/ai/ping
# {"ok": true, "status": "ready"} → siap
# {"status": "not_loaded"} → file .keras belum ada atau error waktu load, cek log terminal
```

Coba predict:
```bash
curl -X POST http://localhost:3000/api/ai/predict \
  -H "Content-Type: application/json" \
  -d '{"input": [1.0, 2.0, 3.0]}'
```

Format input menyesuaikan model masing-masing.

---

## Proteksi route di backend

```js
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'

router.get('/data', requireAuth, handler)       // harus login
router.delete('/data/:id', requireAdmin, handler) // harus admin
```

---

## Progress

- [x] React + Vite + Tailwind
- [x] Express backend
- [x] React Router
- [x] Custom hook `useFetch` dan `useAuth`
- [x] Axios + Vite proxy ke backend
- [x] Simpan data ke JSON file (permanen)
- [x] CRUD items
- [x] Google OAuth 2.0
- [x] Register & login manual
- [x] Flow register via Google (prefill dari profil Google)
- [x] PrivateRoute & GuestRoute di frontend
- [x] `requireAuth` & `requireAdmin` di backend
- [x] Integrasi model `.keras` via Python subprocess
- [ ] Sambungin ke model AI yang sebenarnya
- [ ] Migrasi ke database kalau data makin besar
- [ ] Deployment

---

## Catatan

`data.json` dan `.env` tidak ikut ke git — sudah di-`.gitignore`. Kalau project di-clone ulang, `data.json` akan dibuat otomatis waktu server pertama kali jalan. Untuk `.env`, salin dari `.env.example` lalu isi sendiri.

File `.keras` juga tidak ikut git karena ukurannya bisa besar banget. Simpan sendiri atau pakai cloud storage, taruh manual ke folder `models/` sebelum server dijalankan.
