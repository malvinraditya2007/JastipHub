# JastipHub

Dua proyek terpisah, masing-masing dengan `package.json`, lockfile, dependensi, dan konfigurasi sendiri:

```text
JastipHub/
  jastiphub-backend/     # Express.js + MySQL
  jastiphub-frontend/    # React + Vite + React Router
```

## Menjalankan lokal

Jalankan MySQL terlebih dahulu. Konfigurasi development yang sudah ada tersimpan di `jastiphub-backend/.env` dan memakai MySQL lokal port 33308. Cloud DB belum dihubungkan.

Terminal pertama:

```powershell
cd D:\JastipHub\jastiphub-backend
npm install
npm run db:migrate
npm run dev
```

Terminal kedua:

```powershell
cd D:\JastipHub\jastiphub-frontend
npm install
npm run dev
```

Buka <http://127.0.0.1:5173>. Backend berjalan di <http://127.0.0.1:3001/api/v1/health>.

Jika PowerShell memblokir `npm.ps1`, gunakan `npm.cmd` sebagai pengganti `npm`.

Detail konfigurasi dan struktur:

- [Backend](jastiphub-backend/README.md)
- [Frontend](jastiphub-frontend/README.md)
- [Kontrak API](jastiphub-backend/docs/backend.md)

Frontend dan backend dapat dipindahkan ke repository/hosting masing-masing. Tidak ada impor kode antarproyek. Saat deployment, tentukan origin frontend pada backend dan alamat API pada frontend sesuai panduan di masing-masing proyek.
