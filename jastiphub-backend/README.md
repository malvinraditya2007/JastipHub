# jastiphub-backend

API Express.js dengan SQLite bawaan Node.js. Server yang sama melayani frontend JastipHub.

## Menjalankan

Butuh Node.js 24+. Jalankan dari root repo.

```powershell
npm ci
npm run dev
```

Aplikasi tersedia di <http://127.0.0.1:5173>. Health endpoint: `GET /api/v1/health`.

Saat mulai, backend menerapkan migration SQLite dan menyiapkan data demo untuk development di loopback. Akun dan trip tersimpan di `.data/jastiphub.sqlite`, sedangkan upload tersimpan di `.data/uploads`. Folder `.data` tidak ikut Git.

## Struktur

```text
src/
  index.js              # Memulai server
  app.js                # Express, middleware, CORS, dan file upload
  routes.js             # Request dan respons HTTP
  services/             # Logic aplikasi
  database/
    connection.js       # Koneksi SQLite dan transaksi
    repositories/       # Query database
    migrations/         # Struktur tabel SQL
    migrate.js          # Pelaksanaan migration
    seed.js             # Data contoh development
  config.js             # Konfigurasi environment
  config/destinations.js
  security.js           # Password, token, dan perlindungan request
  validation.js         # Validasi input
  utils/                # Helper tanggal dan nomor telepon
docs/
  backend.md            # Kontrak API
  code-guide.md         # Panduan membaca backend
```

Alur API: **route → service → repository → SQLite**. Semua SQL berada di `src/database/`. `src/web.js` memasang Vite saat development atau menyajikan hasil build `assets/` saat menjalankan `npm start`.

## Konfigurasi database

Salin `.env.example` ke `.env` di root repo bila perlu mengubah setelan. `DB_PATH` mengatur lokasi file SQLite. Path relatif untuk SQLite dan upload dihitung dari folder backend. Set `ENABLE_DEMO=false` untuk mematikan akun demo di development.

Migration mencatat checksum. Tambahkan migration baru untuk perubahan tabel setelah migration sebelumnya diterapkan.

## Frontend, cookie, dan deployment

- Jalankan `npm run build` sebelum `npm start`. Express menyajikan halaman, API, dan upload dari satu origin.
- Dalam production gunakan `NODE_ENV=production` dan isi `APP_ORIGIN` dengan alamat HTTPS publik aplikasi.
- Cookie memakai `COOKIE_SAME_SITE=lax` secara default. Mutasi API diperiksa dengan origin aplikasi dan header CSRF.
- Saat deployment, simpan file `DB_PATH` dan folder `UPLOAD_DIR` di volume persistent agar data tetap ada setelah restart.
- Sesuaikan `HOST`, `PORT`, dan `TRUST_PROXY` dengan hosting. Demo login selalu nonaktif pada production.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Express dan Vite dengan reload |
| `npm run build` | Membuat build frontend di `assets/` |
| `npm start` | Menjalankan API dan hasil build |
| `npm run db:migrate` | Menerapkan migration tanpa menjalankan API |
| `npm run db:seed` | Menyiapkan data demo sekali saat demo diaktifkan |
| `npm run lint` | Memeriksa kode |
| `npm run format` | Merapikan kode |
| `npm run format:check` | Memeriksa format |

Login menggunakan username/password, pemulihan memakai kode pemulihan, tanpa email. Laporan tersimpan dengan status `received`; belum ada dashboard moderator. Upload memakai filesystem persistent dan rate limiter memakai memori satu instance. Belum ada pembayaran atau verifikasi transaksi WhatsApp.
