# JastipHub

JastipHub membantu pengguna mencari perjalanan jastip, melihat toko yang akan dikunjungi, dan menghubungi jastiper lewat WhatsApp. Pengguna juga bisa membuat trip sendiri, menyimpan trip favorit, serta memberi ulasan dengan foto.

Semua perintah di panduan ini dijalankan dari folder utama proyek, yaitu folder yang berisi `package.json`.

## Persiapan pertama kali

1. Pasang Node.js versi 24 atau lebih baru.
2. Buat database bernama `jastiphub` di TiDB Cloud. Nama ini harus sama dengan `DB_NAME` di `.env`.
3. Jika belum ada `.env`, salin [jastiphub-backend/.env.example](jastiphub-backend/.env.example) menjadi `jastiphub-backend/.env`.
4. Isi pengaturan database dan Cloudinary berikut:

```dotenv
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=jastiphub

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Nilai `DB_...` diambil dari detail koneksi TiDB Cloud. Nilai `CLOUDINARY_...` diambil dari akun Cloudinary. Isi ketiga pengaturan Cloudinary agar foto profil, cover trip, dan foto ulasan disimpan di sana.

File `.env` berisi informasi pribadi untuk mengakses layanan tersebut. File ini sudah diabaikan Git; `.env.example` hanya berisi contoh isian kosong.

Setelah itu, buka terminal di folder utama proyek dan jalankan:

```powershell
npm ci
npm run dev
```

`npm ci` memasang paket yang diperlukan proyek. Setelah pemasangan dan pengaturan awal selesai, untuk menjalankan aplikasi lagi cukup gunakan `npm run dev`.

Saat aplikasi mulai berjalan, tabel database disiapkan otomatis melalui migration di `jastiphub-backend/src/database/migrations/`. Jadi, untuk langkah di atas kamu tidak perlu menjalankan `npm run db:init` terpisah. Perintah itu disediakan jika ingin menyiapkan tabel tanpa menyalakan aplikasi.

Buka **<http://127.0.0.1:5173>**. Frontend dan backend berjalan dari alamat yang sama. Port `5173` sudah menjadi bawaan, jadi `.env` cukup berisi tujuh pengaturan di atas untuk setup ini.

Hentikan aplikasi dengan `Ctrl+C` di terminal. Setelah mengubah `.env`, hentikan lalu jalankan kembali aplikasinya. Jika PowerShell menolak perintah `npm`, gunakan `npm.cmd`.

## Cara menggunakan aplikasi

1. **Cari trip** di Explore. Gunakan pencarian, pilihan negara, tanggal, dan urutan hasil sesuai kebutuhan. Daftar toko pada kartu ditampilkan satu baris dengan tombol panah, maksimal lima nama dan penanda jumlah toko lainnya.
2. **Buat akun dan masuk** untuk menyimpan trip atau menghubungi jastiper.
3. **Hubungi jastiper** dari detail trip melalui **Chat via WhatsApp**, lalu **Buka WhatsApp**. Riwayat permintaan kontak bisa dilihat di halaman Profil.
4. **Buat trip sendiri** melalui **Buat Trip**. Isi tujuan, jadwal, toko, dan fee, lalu simpan sebagai draf atau publikasikan. Trip buatanmu dan trip favorit ada di **My Trips**.

Foto profil boleh dikosongkan; aplikasi akan menampilkan inisial nama dengan warna yang bisa dipilih. Cover trip yang belum diunggah akan memakai gambar destinasi otomatis.

Tombol **Kembali** tersedia di halaman akun dan halaman lanjutan. Jika halaman dibuka langsung, tombol mengarah ke halaman yang sesuai, misalnya Explore, Login, atau My Trips.

### Memberi ulasan dan foto bukti

Ulasan tersedia dari riwayat kontak di halaman Profil setelah trip selesai. Pengguna harus sudah masuk dan pernah membuka kontak WhatsApp trip tersebut. Setiap akun hanya bisa memberi satu ulasan per trip dan tidak bisa mengulas trip miliknya sendiri.

Rating 1–5 bintang menilai pengalaman komunikasi dan kejelasan biaya jastiper. Rating di profil jastiper merupakan rata-rata ulasan yang diterima.

Foto bukti bersifat opsional, maksimal tiga foto per ulasan. Foto bisa diperbesar atau dihapus sebelum ulasan dikirim, lalu tampil bersama ulasan di profil jastiper. Foto yang sudah tampil juga bisa dibuka dalam ukuran penuh.

Percakapan, pembayaran, dan kesepakatan dilakukan langsung lewat WhatsApp. Aplikasi mencatat permintaan membuka kontak. Ulasan dan foto merupakan keterangan pengguna; transaksi tidak diperiksa otomatis oleh aplikasi.

## Foto dan gambar

Foto profil, cover trip, dan foto ulasan disimpan di Cloudinary jika ketiga pengaturannya diisi. Kalau semuanya kosong, backend menyimpan foto di folder lokal `jastiphub-backend/storage/uploads/`. Mengisi hanya sebagian pengaturan Cloudinary akan membuat backend menolak mulai berjalan.

Saat Cloudinary aktif, folder upload lokal tidak dibuat. Foto lokal lama yang masih ada tetap bisa dibuka. Upload mendukung JPG, PNG, dan WebP, maksimal 5 MB per foto. Foto ulasan diperkecil bila perlu tanpa memotong isinya.

Gambar bawaan aplikasi ada di `jastiphub-frontend/public/art/`, misalnya logo, bendera, ikon, dan cover destinasi. Ubah gambar bawaan di folder ini.

## Struktur proyek

Gambaran file dan folder utama beserta kegunaannya:

```text
JastipHub/
  README.md                       # Panduan proyek ini
  package.json                    # Daftar paket dan perintah proyek
  package-lock.json               # Catatan versi paket yang dipasang
  .gitignore                      # File yang diabaikan Git
  eslint.config.js                # Aturan pemeriksaan masalah kode
  .prettierrc.json                 # Aturan perapian kode
  .prettierignore                  # File yang dilewati saat merapikan kode

  jastiphub-backend/
    .env                          # Pengaturan database dan Cloudinary
    .env.example                  # Contoh isian pengaturan
    src/
      index.js                    # Menjalankan dan menghentikan server
      app.js                      # Menyatukan bagian-bagian backend
      web.js                      # Menampilkan frontend dari server
      config.js                   # Membaca pengaturan dari .env
      config/destinations.js      # Daftar negara dan cover destinasi
      routes.js                   # Mendaftarkan alamat layanan backend
      routes/                     # Layanan akun, trip, ulasan, dan upload
      services/                   # Proses di balik fitur aplikasi
      security.js                 # Pemeriksaan password dan akses akun
      validation.js               # Memeriksa data yang dikirim pengguna
      utils/                      # Fungsi kecil yang dipakai bersama
      database/
        connection.js             # Menghubungkan aplikasi ke TiDB/MySQL
        init.js                   # Menyiapkan tabel database
        repositories/             # Membaca dan menyimpan data
        migrations/
          001_initial.sql         # Susunan tabel awal, termasuk foto ulasan
          002_remove_account_recovery.js # Menghapus kolom fitur akun yang sudah dihapus

  jastiphub-frontend/
    index.html                    # Halaman awal yang memuat aplikasi
    vite.config.js                # Pengaturan saat ngoding dan build
    src/
      main.jsx                    # Memulai React dan menentukan halaman
      styles.css                  # Warna, font, dan aturan tampilan
      data.js                     # Pilihan negara, cover, dan format tampilan
      images.js                   # Memeriksa gambar sebelum diunggah
      pages/                      # Halaman login, Explore, profil, dan trip
      components/                 # Bagian tampilan yang dipakai bersama
        Layout.jsx                # Bagian atas halaman dan navigasi
        UI.jsx                    # Tombol, dialog, tampilan loading, dan tombol kembali
        ReviewPhotos.jsx          # Foto ulasan dan tampilan saat diperbesar
      services/
        api.js                    # Mengirim permintaan ke backend
        store.jsx                 # Data akun dan aksi yang dipakai bersama
        resource-cache.js         # Menyimpan data sementara agar pindah halaman lebih cepat
      utils/avatar.js             # Menentukan inisial dan warna avatar
    public/art/                   # Gambar dan ikon bawaan
      flags/                      # Bendera negara
      covers/                     # Cover destinasi
    dist/                         # Hasil build; dibuat otomatis
      index.html                  # Halaman awal versi hasil build
      assets/                     # JavaScript, CSS, dan font hasil build
      art/                        # Salinan gambar dari public/art/
```

## Build untuk hosting

Saat masih mengerjakan proyek, gunakan `npm run dev`. Untuk membuat dan menjalankan versi yang siap di-hosting:

```powershell
npm run build
npm start
```

Build mengemas kode dan menyalin gambar ke folder `dist/`. File di dalamnya dibuat otomatis. Kerjakan perubahan di `src/` atau `public/`, lalu build ulang.

Saat dipasang di hosting, tambahkan `NODE_ENV=production` dan isi `APP_ORIGIN` dengan alamat HTTPS situs. Jika hosting menentukan port sendiri, sesuaikan `PORT`. Pengaturan tambahan tersedia di [config.js](jastiphub-backend/src/config.js).

## Daftar perintah

| Perintah               | Kegunaan                                                 |
| ---------------------- | -------------------------------------------------------- |
| `npm ci`               | Memasang paket proyek dari daftar versi yang tersimpan   |
| `npm run dev`          | Menjalankan aplikasi selama pengembangan                 |
| `npm run db:init`      | Menyiapkan tabel tanpa menyalakan aplikasi               |
| `npm run build`        | Membuat versi siap hosting ke folder `dist/`             |
| `npm start`            | Menjalankan aplikasi dari hasil build                    |
| `npm run lint`         | Mencari masalah kode, termasuk import yang tidak dipakai |
| `npm run format`       | Merapikan spasi, indentasi, dan susunan kode             |
| `npm run format:check` | Memeriksa kerapian kode tanpa mengubah file              |
