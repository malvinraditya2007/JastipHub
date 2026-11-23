# jastiphub-frontend

Antarmuka JastipHub menggunakan React, Vite, dan React Router. Dependensi dan perintah npm berada di root repo.

## Menjalankan

Jalankan dari root repo:

```powershell
npm ci
npm run dev
```

Buka <http://127.0.0.1:5173>. Halaman, `/api`, dan `/uploads` dilayani dari alamat yang sama.

## Struktur kode

| File | Isi |
|---|---|
| `vite.config.js` | Konfigurasi Vite untuk development dan build frontend |
| `src/main.jsx` | Titik masuk React dan route |
| `src/pages/` | Halaman Explore, detail trip, My Trips, editor, profil, ulasan, login/daftar, dan lupa password |
| `src/components/` | Layout, tombol, dialog, kartu trip, gambar, dan ikon yang dipakai bersama |
| `src/services/api.js` | Request API, CSRF, cookie, dan timeout |
| `src/services/store.jsx` | Sesi, aksi bersama, dan pembacaan resource |
| `src/data.js` | Helper tampilan, pilihan negara, dan preview cover |
| `src/styles.css` | Import Tailwind CSS v4, tema, breakpoint, dan default elemen HTML; styling komponen langsung di `className` JSX |
| `public/art/` | Aset gambar dan ikon bawaan |
| `public/art/flags/` | Bendera untuk filter destinasi |
| `public/art/covers/` | Cover default destinasi dan cover universal |

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan aplikasi dengan Vite |
| `npm run build` | Membuat build frontend di `jastiphub-frontend/dist/` |
| `npm start` | Menjalankan hasil build dan API |
| `npm run lint` | Memeriksa kode frontend dan backend |
| `npm run format` | Merapikan kode |
| `npm run format:check` | Memeriksa format |

## Deployment

Build dengan `npm run build`, lalu jalankan aplikasi dengan `npm start`. Express menangani URL halaman seperti `/trips/tokyo` dan menyajikan API di server yang sama.

Vite menyalin `public/art/` ke `dist/art/`. JavaScript, CSS, dan font hasil build masuk ke `dist/assets/`. File `dist/index.html` menjadi halaman masuk aplikasi. Semua path `dist/` ini berada di dalam `jastiphub-frontend/`.
