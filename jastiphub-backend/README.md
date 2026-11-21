# jastiphub-backend

API Express.js dengan database MySQL melalui `mysql2`. Proyek ini dapat dijalankan tanpa folder frontend.

## Menjalankan

Butuh Node.js 24+ dan layanan MySQL yang sudah memiliki database.

1. Jalankan `npm ci`.
2. Salin `.env.example` ke `.env` jika belum ada, lalu isi koneksi MySQL.
3. Jalankan `npm run db:migrate`.
4. Opsional untuk development: set `ENABLE_DEMO=true`, lalu `npm run db:seed`.
5. Jalankan `npm run dev`.

Backend development tersedia di <http://127.0.0.1:3001>. Health endpoint: `GET /api/v1/health`.

Konfigurasi lokal yang dipindahkan dari proyek sebelumnya tetap ada di `.env` dan memakai MySQL port 33308. Data upload tetap ada di `.data/uploads`. File-file tersebut tidak ikut Git. Tidak ada perubahan pada data akun/trip atau isi migration saat pemindahan folder.

## Struktur

```text
src/
  index.js              # Memulai server
  app.js                # Express, middleware, CORS, dan file upload
  routes.js             # Request dan respons HTTP
  services/             # Logic aplikasi
  database/
    connection.js       # Pool MySQL dan transaksi
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

Alur: **route → service → repository → MySQL**. Semua SQL berada di `src/database/`. Tidak ada ketergantungan pada file React/Vite.

## Koneksi MySQL / TiDB

Isi `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME`, atau gunakan `DATABASE_URL=mysql://user:password@host:port/database`. Karakter khusus pada URL perlu di-encode.

Untuk cloud, aktifkan `DB_SSL=true`. Jika provider memberi CA, isi `DB_SSL_CA` dengan path sertifikat relatif terhadap folder backend atau path absolut. Verifikasi sertifikat tetap aktif. TiDB Cloud memakai endpoint MySQL-compatible dan port dari provider (umumnya 4000). Koneksi cloud perlu diperiksa setelah detail akun tersedia.

Database harus sudah dibuat melalui provider. Migration membuat tabel dan mencatat checksum. Jangan mengubah file SQL yang sudah diterapkan; tambahkan migration baru untuk perubahan tabel.

## Frontend, cookie, dan deployment

- `APP_ORIGIN` adalah origin frontend, misalnya `http://127.0.0.1:5173` saat development.
- CORS hanya mengizinkan origin frontend yang dikonfigurasi; credential cookie dan header CSRF didukung.
- Dalam production gunakan `NODE_ENV=production`, `APP_ORIGIN=https://domain-frontend`, serta HTTPS untuk API.
- Cookie memakai `COOKIE_SAME_SITE=lax` secara default. Jika frontend dan API berada pada site berbeda, gunakan `COOKIE_SAME_SITE=none` dengan HTTPS. Kebijakan browser terhadap third-party cookie masih berlaku; reverse proxy satu origin menghindari ketergantungan pada third-party cookie.
- `UPLOAD_DIR` memakai path relatif folder backend, default `.data/uploads`. Gunakan volume persistent saat deployment.
- Express melayani API dan `/uploads`, tanpa melayani HTML/build frontend. Deployment frontend diatur terpisah.
- Sesuaikan `HOST`, `PORT`, dan `TRUST_PROXY` dengan hosting. Demo login selalu nonaktif pada production.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Express dengan reload ketika kode berubah |
| `npm start` | Express tanpa watch |
| `npm run db:migrate` | Menerapkan migration |
| `npm run db:seed` | Data contoh development |
| `npm run lint` | Memeriksa kode |
| `npm run format` | Merapikan kode |
| `npm run format:check` | Memeriksa format |

Login menggunakan username/password, pemulihan memakai kode pemulihan, tanpa email. Laporan tersimpan dengan status `received`; belum ada dashboard moderator. Upload memakai filesystem persistent dan rate limiter memakai memori satu instance. Belum ada pembayaran atau verifikasi transaksi WhatsApp.
