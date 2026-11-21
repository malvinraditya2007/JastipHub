# jastiphub-frontend

Antarmuka JastipHub menggunakan React + Vite + React Router. Proyek ini memiliki dependensi dan build sendiri, tanpa mengimpor kode backend.

## Menjalankan

```powershell
npm ci
npm run dev
```

Buka <http://127.0.0.1:5173>. Untuk fitur yang memakai data, jalankan `jastiphub-backend` dan MySQL juga.

Salin `.env.example` menjadi `.env` jika perlu mengubah alamat koneksi:

```dotenv
API_PROXY_TARGET=http://127.0.0.1:3001
VITE_API_BASE_URL=
```

Saat development, Vite meneruskan `/api` dan `/uploads` ke `API_PROXY_TARGET`. Jika backend berada di port/host lain, ubah variabel tersebut lalu restart Vite.

`VITE_API_BASE_URL` boleh tetap kosong untuk proxy Vite atau reverse proxy production satu origin. Jika API berada pada origin terpisah, isi origin-nya tanpa `/api/v1`, misalnya `https://api.example.com`. Request API dan URL gambar upload akan memakai origin tersebut. Nilai `VITE_*` masuk ke bundle browser; jangan taruh password atau konfigurasi database di sini.

## Struktur kode

| File | Isi |
|---|---|
| `src/main.jsx` | Titik masuk React dan route |
| `src/Explore.jsx` | Pencarian, filter, dan kartu trip |
| `src/Trips.jsx` | Detail trip, jastiper, My Trips, WhatsApp, dan laporan |
| `src/Editor.jsx` | Membuat/mengedit trip dan cover |
| `src/Auth.jsx` | Daftar, login, dan pemulihan password |
| `src/Account.jsx` | Profil, riwayat kontak, dan ulasan |
| `src/store.jsx` | Sesi, aksi bersama, dan pembacaan resource |
| `src/api.js` | Request API, CSRF, cookie, timeout, dan URL media |
| `src/ui.jsx` | Komponen UI bersama |
| `src/Art.jsx` | Gambar dan ikon |
| `src/data.js` | Helper tampilan, pilihan negara, dan preview cover |
| `src/styles.css` | Gaya dan responsivitas |
| `public/art/` | Aset gambar dan ikon bawaan |

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server Vite lokal |
| `npm run build` | Membuat folder `dist/` |
| `npm run preview` | Menampilkan build lokal; koneksi API tetap perlu proxy/origin yang sesuai |
| `npm run lint` | Memeriksa kode React |
| `npm run format` | Merapikan kode |
| `npm run format:check` | Memeriksa format |

## Deployment

Build dengan `npm run build`, lalu deploy `dist/` ke hosting frontend. Atur rewrite route SPA ke `index.html` agar URL seperti `/trips/tokyo` bisa dibuka langsung.

Untuk satu origin, reverse proxy harus meneruskan `/api` dan `/uploads` ke backend; `VITE_API_BASE_URL` tetap kosong. Untuk origin terpisah, isi `VITE_API_BASE_URL` sebelum build dan sesuaikan `APP_ORIGIN` backend dengan origin frontend. Pengaturan cookie untuk site berbeda dijelaskan di README backend.
