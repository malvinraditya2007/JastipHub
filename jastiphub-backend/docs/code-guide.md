# Panduan membaca backend

Mulai dari `src/index.js`, lalu ikuti alur berikut:

1. `src/app.js` menyiapkan Express, middleware, CORS, dan sesi.
2. `src/routes.js` menerima request, memvalidasi payload, dan mengirim respons.
3. `src/services/` menjalankan aturan aplikasi.
4. `src/database/repositories/` mengakses SQLite.

Contoh publikasi trip: route `POST /api/v1/trips` memanggil `services.trips.save(...)`. `src/services/trip-service.js` memeriksa kepemilikan, status, versi, serta perubahan jadwal. Setelah itu repository di `src/database/repositories/trips.js` menyimpan trip dan toko dalam satu transaksi.

## Logic aplikasi

| File | Isi |
|---|---|
| `src/services/auth-service.js` | Akun, password, sesi, dan pemulihan |
| `src/services/user-service.js` | Profil publik/pribadi dan ulasan profil |
| `src/services/trip-service.js` | Pencarian, detail, draft/publikasi, editor, dan favorit |
| `src/services/interaction-service.js` | Kontak, kelayakan ulasan, pengiriman ulasan, dan laporan |
| `src/services/media-service.js` | Kepemilikan media, pemrosesan gambar, dan penyimpanan file |

Service tidak menulis SQL atau mengirim respons Express. Service memanggil repository seperti `repositories.trips.findById(...)`.

## Database

- `src/database/connection.js`: koneksi SQLite, parameter SQL, dan transaksi.
- `src/database/repositories/`: query berdasarkan kelompok data.
- `src/database/migrations/`: SQL pembentukan/perubahan tabel.
- `src/database/migrate.js`: penerapan migration dan pemeriksaan checksum.
- `src/database/seed.js`: data contoh untuk development.

Repository tidak menerima `req`/`res` dan tidak menentukan status HTTP. Semua query memakai parameter terpisah dari teks SQL.

## Konfigurasi dan helper

- `src/config.js`: membaca environment backend, CORS origin, kebijakan cookie, upload, dan lokasi file SQLite.
- `src/config/destinations.js`: negara, alias, dan nama cover yang diberikan API.
- `src/utils/`: helper tanggal dan nomor telepon.
- `src/security.js`: hashing password, token, dan perlindungan request.
- `src/validation.js`: aturan input.
- `src/http.js`: respons sukses dan rate limiter.
- `src/errors.js`: penanganan error.

Gunakan `npm run format` dan `npm run lint` untuk menjaga keterbacaan kode. Jangan memformat ulang migration yang sudah diterapkan.
