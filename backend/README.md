# MyApp — Backend (Express)

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```
API jalan di http://localhost:3000

## Endpoints
| Method | URL            | Fungsi          |
|--------|----------------|-----------------|
| GET    | /api/items     | Ambil semua     |
| GET    | /api/items/:id | Ambil satu      |
| POST   | /api/items     | Buat baru       |
| PUT    | /api/items/:id | Update          |
| DELETE | /api/items/:id | Hapus           |
