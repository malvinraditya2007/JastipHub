# jastiphub-backend

API Express.js dengan MySQL/TiDB Cloud melalui `mysql2`. Server yang sama melayani frontend JastipHub.

## Menjalankan

Butuh Node.js 24+ dan MySQL 8.0.16+ atau TiDB Cloud. Siapkan `.env` di folder backend sebelum menjalankan perintah dari root repo.

```powershell
npm ci
npm run db:init
npm run dev
```

Aplikasi tersedia di <http://127.0.0.1:5173>. Health endpoint: `GET /api/v1/health`.

Saat mulai, backend menyiapkan tabel MySQL/TiDB melalui `src/database/init.js`. Akun, trip, sesi, dan ulasan tersimpan di server database. File upload tersimpan di `storage/uploads/`; folder `storage` tidak ikut Git.

## Struktur

```text
src/
  index.js              # Memulai server
  app.js                # Express, middleware, CORS, dan file upload
  routes.js             # Mendaftarkan kelompok endpoint API
  routes/
    auth.js             # Daftar, login, sesi, dan lupa password
    users.js            # Profil dan ulasan pengguna
    trips.js            # Pencarian, editor, dan trip favorit
    interactions.js     # Kontak WhatsApp, ulasan trip, dan laporan
    media.js            # Upload gambar
  services/             # Logic aplikasi
  database/
    connection.js       # Pool MySQL/TiDB dan transaksi
    init.js             # Inisialisasi tabel dan perintah db:init
    repositories/       # Query database
    migrations/         # Perubahan struktur tabel SQL/JavaScript
    seed.js             # Data contoh development
  config.js             # Konfigurasi environment
  config/destinations.js
  security.js           # Password, token, dan perlindungan request
  validation.js         # Validasi input
  utils/                # Helper tanggal dan nomor telepon
```

Alur API: **route → service → repository → MySQL/TiDB**. Semua SQL berada di `src/database/`. `src/web.js` memasang Vite saat development atau menyajikan hasil build `jastiphub-frontend/dist/` saat menjalankan `npm start`.

## Konfigurasi database

Salin `.env.example` ke `.env` di folder `jastiphub-backend/`. Perintah npm dari root repo otomatis membaca file tersebut. Isi `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` dari menu Connect TiDB Cloud. Buat database yang disebut dalam `DB_NAME` di TiDB terlebih dahulu; `db:init` membuat tabel di dalamnya. Kredensial ini hanya dipakai backend.

`DB_SSL=true` mengaktifkan TLS dengan verifikasi sertifikat untuk TiDB Cloud. Untuk MySQL lokal biasanya gunakan `DB_PORT=3306` dan `DB_SSL=false` jika TLS belum dikonfigurasi. `UPLOAD_DIR` dihitung relatif terhadap folder backend. Set `ENABLE_DEMO=true` hanya jika ingin menyiapkan akun dan trip demo saat development.

Inisialisasi mencatat checksum migration. Tambahkan migration baru untuk perubahan tabel setelah migration sebelumnya diterapkan. DDL MySQL/TiDB tidak dibungkus transaksi; migration awal memakai `CREATE TABLE IF NOT EXISTS` agar dapat dilanjutkan setelah kegagalan. Jalankan inisialisasi dari satu proses sebelum menambah instance aplikasi.

## Frontend, cookie, dan deployment

- Jalankan `npm run build` sebelum `npm start`. Express menyajikan halaman, API, dan upload dari satu origin.
- Dalam production gunakan `NODE_ENV=production` dan isi `APP_ORIGIN` dengan alamat HTTPS publik aplikasi.
- Cookie memakai `COOKIE_SAME_SITE=lax` secara default. Mutasi API diperiksa dengan origin aplikasi dan header CSRF.
- Saat deployment, gunakan database MySQL/TiDB persistent dan simpan folder `UPLOAD_DIR` di volume persistent agar gambar tetap ada setelah restart.
- Sesuaikan `HOST`, `PORT`, dan `TRUST_PROXY` dengan hosting. Demo login selalu nonaktif pada production.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Express dan Vite dengan reload |
| `npm run build` | Membuat build frontend di `jastiphub-frontend/dist/` |
| `npm start` | Menjalankan API dan hasil build |
| `npm run db:init` | Menyiapkan tabel dan menerapkan migration tanpa menjalankan API |
| `npm run db:seed` | Menyiapkan data demo sekali saat demo diaktifkan |
| `npm run lint` | Memeriksa kode |
| `npm run format` | Merapikan kode |
| `npm run format:check` | Memeriksa format |

Username dan password wajib diisi, tanpa syarat format atau panjang minimum selain tidak kosong. Username dapat berisi spasi, simbol, atau Unicode; penulisan disimpan, pencarian akun tidak membedakan huruf besar/kecil, dan username harus unik. Migration `002_flexible_usernames.js` menyesuaikan penyimpanan username yang sebelumnya terbatas 30 karakter.

Login menggunakan username/password, pemulihan memakai kode pemulihan, tanpa email. Laporan tersimpan dengan status `received`; belum ada dashboard moderator. Upload memakai filesystem persistent dan rate limiter memakai memori satu instance. Belum ada pembayaran atau verifikasi transaksi WhatsApp.
