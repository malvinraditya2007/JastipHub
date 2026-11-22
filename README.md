# JastipHub

Satu aplikasi dengan satu `package.json` di root. Express melayani halaman React, API, dan upload di alamat yang sama.

```text
JastipHub/
  jastiphub-backend/     # Express.js + SQLite
  jastiphub-frontend/    # React + Vite + React Router
```

## Menjalankan lokal

Butuh Node.js 24+. Backend otomatis membuat database SQLite dan mengisi data demo saat pertama dijalankan. File `jastiphub-backend/.data/jastiphub.sqlite` tersimpan di komputer masing-masing dan diabaikan Git.

Jalankan dari root repo:

```powershell
npm ci
npm run dev
```

Buka <http://127.0.0.1:5173>. Endpoint health tersedia di `/api/v1/health`.

Jika PowerShell memblokir `npm.ps1`, gunakan `npm.cmd` sebagai pengganti `npm`.

Untuk mereset akun development lewat web, buka `jastiphub-backend/.data/.jastiphub-local.html` di browser setelah server berjalan. File ini dibuat otomatis di samping database. Dari halaman login, pilih **Lupa password**, lalu isi username dan password baru. Buka ulang file pembuka kalau sesi lokal sudah lewat 30 menit.

Untuk menjalankan hasil build, gunakan `npm run build` lalu `npm start`, juga dari root. Hasil build masuk ke `assets/` dan diabaikan Git. Salin `.env.example` ke `.env` di root jika perlu mengubah setelan. Pindahkan setelan khusus dari `jastiphub-backend/.env` lama bila ada.

Detail konfigurasi dan struktur:

- [Backend](jastiphub-backend/README.md)
- [Frontend](jastiphub-frontend/README.md)
- [Kontrak API](jastiphub-backend/docs/backend.md)
