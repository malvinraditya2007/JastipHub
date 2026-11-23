# JastipHub

Satu aplikasi dengan satu `package.json` di root. Express melayani halaman React, API, dan upload di alamat yang sama.

```text
JastipHub/
  jastiphub-backend/     # Express.js + MySQL/TiDB Cloud
  jastiphub-frontend/    # React + Vite + React Router
```

## Menjalankan lokal

Butuh Node.js 24+ dan MySQL 8.0.16+ atau TiDB Cloud. Buat database `jastiphub` di server database, lalu salin `jastiphub-backend/.env.example` ke `jastiphub-backend/.env`. Isi `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` dari detail koneksi database. Untuk TiDB Cloud biarkan `DB_SSL=true`; untuk MySQL lokal gunakan port yang sesuai (biasanya 3306) dan `DB_SSL=false` bila server lokal tidak memakai TLS.

Jalankan dari root repo:

```powershell
npm ci
npm run db:init
npm run dev
```

Buka <http://127.0.0.1:5173>. Endpoint health tersedia di `/api/v1/health`.

Jika PowerShell memblokir `npm.ps1`, gunakan `npm.cmd` sebagai pengganti `npm`.

`src/database/init.js` pada backend menyiapkan tabel MySQL/TiDB dan mencatat migration yang sudah diterapkan. Backend juga memanggil inisialisasi ini saat mulai. Akun dan trip tersimpan di server database; gambar upload tersimpan di `jastiphub-backend/storage/uploads/` dan diabaikan Git. Data demo hanya disiapkan jika `ENABLE_DEMO=true` saat development.

Untuk development dengan database MySQL lokal, pembuka reset password berada di `jastiphub-backend/storage/.jastiphub-local.html`. Fitur reset lokal ini tidak aktif untuk database cloud; gunakan kode pemulihan akun dari alur daftar.

Untuk menjalankan hasil build, gunakan `npm run build` lalu `npm start`, juga dari root. Hasil build masuk ke `jastiphub-frontend/dist/` dan diabaikan Git. Salin `jastiphub-backend/.env.example` ke `jastiphub-backend/.env` jika perlu mengubah setelan.

Detail konfigurasi dan struktur:

- [Backend](jastiphub-backend/README.md)
- [Frontend](jastiphub-frontend/README.md)
