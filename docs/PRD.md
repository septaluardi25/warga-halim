# PRD Warga Halim

Nov 14, 2026 · @samid

Warga Halim adalah website kenangan untuk mantan karyawan perusahaan yang sudah bubar: mantan karyawan membuat akun, lalu melihat biodata rekan-rekan lamanya. Dokumen ini ditulis untuk programmer junior dan model AI berkemampuan lebih rendah, jadi setiap bagian dibuat singkat dan eksplisit.

## Ringkasan

- **Nama web:** Warga Halim&#32;
- **Pengguna:** mantan karyawan (user) dan satu admin (pemilik proyek).
- **Inti produk:** daftar akun, login, lalu melihat daftar dan detail biodata mantan karyawan (sekitar 25 orang). Beranda menampilkan slideshow album dan video.
- **Bahasa antarmuka:** Indonesia (seluruh teks antarmuka, tombol, label, placeholder, notifikasi toast, dan validasi berbahasa Indonesia). Rute utama `/members`, `/gallery`, `/login`, `/register` didukung bersama alias rute lama bahasa Indonesia.
- **Urutan kerja:** frontend dulu (dengan data dummy), baru backend.

## Ruang Lingkup

Versi pertama hanya mencakup akun, login, dan lihat biodata; fitur sosial ditunda.

| Fitur | Status |
| --- | --- |
| Registrasi dan login user | Wajib (MVP) |
| Login admin dan dashboard admin | Wajib (MVP) |
| Admin tambah, ubah, hapus biodata (termasuk upload 3 sampai 10 foto per orang) | Wajib (MVP) |
| Admin kelola album (1 sampai 50 foto: buat album baru, tambah foto dengan tombol terpisah, ubah album [judul, urutan, & hapus foto lama], hapus album) dan satu video YouTube | Wajib (MVP) |
| Admin kelola akun user (lihat daftar dan hapus akun) di halaman `/admin/users` (alias `/admin/akun`) | Wajib (MVP) |
| Daftar biodata dengan pencarian nama | Wajib (MVP) |
| Halaman detail biodata (hanya user yang login) | Wajib (MVP) |
| Beranda berisi profil perusahaan singkat (teks statis, tanpa database) | Wajib (MVP) |
| Slideshow album dan video di beranda | Wajib (MVP) |
| Pesan dan kesan pada biodata (hanya diisi admin; user hanya bisa membaca) | Wajib (MVP) |
| Foto biodata: 3 sampai 10 foto per orang (kartu 1 foto, di detail foto bisa diklik untuk berganti) | Wajib (MVP) |
| Halaman galeri: semua album dan foto kenangan (publik, tanpa login; foto dapat diklik untuk memperbesar gambar dalam lightbox). Album bersifat umum/bersama, bukan per karyawan | Wajib (MVP) |
| Reset password lewat email | Nanti |

Di luar scope: pembayaran, chat realtime, aplikasi mobile native, dan upload foto oleh user biasa.

## Peran dan Hak Akses

Ada dua peran: `admin` (satu akun) dan `user` (mantan karyawan yang mendaftar sendiri).

| Aksi | Pengunjung | User | Admin |
| --- | --- | --- | --- |
| Lihat beranda | Ya | Ya | Ya |
| Lihat galeri album dan foto kenangan | Ya | Ya | Ya |
| Daftar dan login | Ya | Ya | Ya |
| Lihat daftar dan detail biodata | Tidak | Ya | Ya |
| Tambah, ubah, hapus biodata dan foto | Tidak | Tidak | Ya |
| Mengisi atau mengubah pesan dan kesan | Tidak | Tidak | Ya |
| Upload foto (biodata maupun album) | Tidak | Tidak | Ya |
| Tambah album, tambah foto (tombol terpisah), ubah album (judul, urutan, hapus foto), hapus album, pasang atau hapus video | Tidak | Tidak | Ya |
| Lihat daftar akun user, ubah akun user (nama), dan hapus akun user | Tidak | Tidak | Ya |

Akun admin dibuat otomatis oleh skrip seed dengan username `admin` (atau fallback dari `.env`). Password admin diambil dari file `.env` lokal, tidak pernah ditulis di kode atau dokumen ini.

## Fitur dan Alur Pengguna

**Alur user**

1. Buka beranda, baca profil perusahaan.
2. Klik Register (`/register`), isi nama, username (minimal 3 karakter), password, dan re-enter password (`confirmPassword`), lalu kirim.
3. Login (`/login`) dengan username (minimal 3 karakter) dan password. User yang sudah login tidak bisa membuka halaman `/login` atau `/register` lagi dan otomatis diarahkan ke `/members` (user) atau `/admin` (admin).
4. Buka halaman Members (`/members`), cari nama.
5. Klik satu kartu untuk melihat detail biodata (`/members/:id`).
6. Logout.

**Alur admin**

1. Login di halaman yang sama dengan user (`/login`).
2. Otomatis diarahkan ke dashboard admin (`/admin`).
3. Tambah biodata baru: isi form, upload 3 sampai 10 foto, simpan.
4. Ubah atau hapus biodata dari tabel di dashboard.
5. Buka halaman Kelola Akun (`/admin/users`, alias `/admin/akun`) untuk melihat daftar akun user dan menghapus akun bila perlu.

**Aturan fitur**

- Daftar biodata (`/members`) dan detail (`/members/:id`) hanya bisa dibuka setelah login (`ProtectedRoute`); pengunjung yang belum login diarahkan ke `/login`. Sebaliknya, pengunjung yang sudah login diblokir dari `/login` (`/masuk`) dan `/register` (`/daftar`) oleh `GuestRoute` dan diarahkan ke `/admin` (jika admin) atau `/members` (jika user).
- Biodata berisi: nama lengkap (wajib), posisi (wajib), tanggal lahir (wajib), domisili tinggal (wajib), no whatsapp (opsional), media sosial (opsional), 3 sampai 10 foto (wajib), serta pesan dan kesan (opsional). Tidak ada divisi, tahun masuk, atau tahun keluar.
- Semua foto (biodata maupun album) hanya diunggah oleh admin. User tidak punya form atau endpoint upload.
- Form daftar: nama minimal 6 karakter (maksimal 100), username minimal 3 karakter (maksimal 100, tidak boleh berbentuk email; jika berupa format email muncul pesan "Username tidak valid", placeholder menampilkan contoh username seperti "Contoh: budi_santoso"), password minimal 8 karakter, dan re-enter password (`confirmPassword`) harus cocok dengan password. Dicek di form (React Hook Form + Zod) dan untuk `name`/`username`/`password` juga dicek di backend dengan Zod.
- Kolom password (termasuk kolom re-enter password pada form daftar) memiliki tombol berlogo mata (ikon mata) untuk menampilkan/menyembunyikan password, serta dikecualikan dari navigasi tombol keyboard Tab (`tabIndex="-1"`).
- Halaman `/login` (`/masuk`) dan `/register` (`/daftar`) memakai layout card 2 kolom (`max-w-4xl`): kolom kiri berisi form login/pendaftaran, dan kolom kanan menampilkan panel tipografi editorial yang menyatu di dalam card yang sama.
- Login tetap tersimpan setelah halaman di-refresh: token dan data user disimpan di `localStorage` lewat middleware `persist` bawaan Zustand. Saat aplikasi dibuka, frontend memanggil `GET /api/auth/me` untuk memastikan token masih berlaku.
- Logout menghapus token dari Zustand dan `localStorage` (tidak ada endpoint logout).
- Setelah sesi berakhir (token kedaluwarsa), user diarahkan kembali ke `/login` dengan pesan toast.

**Kelola akun user (admin):** halaman `/admin/users` (alias `/admin/akun`) menampilkan tabel akun dengan role `user` (nama, username, tanggal daftar), tombol ubah nama pengguna (username dan password bersifat tetap dan tidak dapat diedit demi keamanan), dan tombol hapus dengan konfirmasi. Akun admin tidak tampil di tabel dan tidak bisa diedit atau dihapus. Akun yang dihapus tidak bisa login lagi; token lamanya ditolak karena `GET /api/auth/me` dan middleware auth memeriksa bahwa user masih ada di database.

**Profil perusahaan:** satu bagian teks singkat (2 sampai 3 paragraf) dalam bahasa Inggris di beranda, ditulis langsung di file `src/content/profilPerusahaan.ts`. Tidak disimpan di database dan tidak punya endpoint API; untuk mengubahnya, edit file lalu deploy ulang.

**Pesan dan kesan & tampilan detail member:** satu teks panjang per orang (maksimal 1000 karakter), ditampilkan di halaman detail member (`/members/:id`) dengan tata letak 2 kolom (gambar galeri foto di sebelah kiri dan data biodata di sebelah kanan tersusun vertikal secara *flex column* ke bawah: Nama Lengkap, Posisi, Tanggal Lahir, Domisili Tinggal, No. WhatsApp, Media Sosial, serta Pesan & Kesan yang disajikan langsung sebagai teks murni tanpa card/wadah tersendiri) dengan estetika *flat design* yang bersih (tanpa bayangan berlebih dan tanpa gradien). Hanya admin yang mengisi dan mengubahnya, di form biodata admin bersama biodata lainnya. User tidak punya form, tombol, atau endpoint untuk menulis atau mengubah pesan dan kesan; user hanya bisa membacanya di halaman detail.

**Foto biodata:** setiap orang wajib punya 3 sampai 10 foto (dicek di form dan di backend dengan Zod). Foto pertama menjadi foto kartu: di daftar member, kartu hanya menampilkan foto itu. Di halaman detail (`/members/:id`), hanya ditampilkan foto utama besar yang bisa diklik untuk berganti ke foto berikutnya (**tanpa** deretan thumbnail foto lainnya di bawah foto utama). Urutan foto diatur admin. Pergantian foto memakai state React dan Tailwind, tanpa library tambahan. Format jpg, png, atau webp, maksimal 2 MB per foto.

**Beranda, Hero, slideshow album dan video:** beranda (`/`) memakai layout penuh tanpa padding luar di `<main>` sehingga bagian **Hero** berlatar gambar perkantoran (*office background image* dengan overlay gelap-biru langit agar teks terbaca jelas, pill badge, headline besar, serta tombol CTA pill menuju `/gallery` dan `/members` tanpa bar putih di bagian bawah seperti pada `docs/pict/bar.png`) dan section **About Warga Halim** (*Company Profile*, `bg-white`) menyatu mulus dengan `Navbar` di lebar penuh (`w-full`). Di bawahnya, bagian **slideshow album dan satu video YouTube** dibungkus dalam section berlatar gradasi biru langit yang berbeda dari section sebelumnya dengan lebar **80%** (`md:w-[80%] mx-auto`, tidak full-width). Slideshow memutar foto dari banyak album secara otomatis (ganti tiap 5 detik, berhenti saat disentuh atau kursor di atasnya), dengan judul album di bawah foto serta tombol sebelumnya dan berikutnya. Di bawahnya ada satu video YouTube, dimuat hanya saat bagian itu terlihat. Website hanya menyimpan satu video: admin menempel judul dan link YouTube; jika sudah ada video, video lama otomatis diganti yang baru. Admin juga bisa menghapus video; jika belum ada video, bagian video di beranda tidak ditampilkan. Hero, profil perusahaan, slideshow, dan video tampil untuk semua pengunjung tanpa login. Admin mengelola album dan video dari dashboard. Foto kenangan tidak dipisah dari album: semua foto kenangan masuk ke album, dan semua album bisa dilihat di halaman galeri (`/gallery`, alias `/galeri`) tanpa login.

**Album bersifat umum, bukan per karyawan:** album adalah kumpulan foto kenangan bersama yang sama untuk semua pengunjung. Album tidak terhubung ke biodata warga mana pun (tabel `albums` tidak punya kolom `warga_id`), dan halaman detail warga tidak menampilkan album. Setiap album dapat memuat 1 sampai 50 foto. Pada panel admin (`/admin/albums`), aksi untuk setiap album dipisahkan dengan jelas menjadi: tombol **+ Tambah Foto** (membuka form khusus penambahan foto baru hingga kuota 50 foto), tombol **Ubah Album** (membuka form edit judul dan manajemen foto lama seperti urutan atau hapus foto), serta tombol **Hapus Album**. Pada halaman galeri publik (`/gallery`, alias `/galeri`), setiap foto dalam album dapat diklik oleh pengunjung untuk membuka tampilan perbesar gambar (*lightbox modal*) yang dilengkapi tombol navigasi foto sebelumnya/berikutnya, thumbnail strip, serta dukungan tombol keyboard (Escape, tanda panah kiri/kanan). Foto biodata (3 sampai 10 foto per orang, foto pertama jadi foto kartu) tetap terpisah di tabel `warga_photos` dan aturannya tidak berubah.

## Halaman dan Panduan UI/UX

Semua teks antarmuka berbahasa **Indonesia** (rute bahasa Inggris dan alias rute bahasa Indonesia tetap didukung agar tautan lama tetap bekerja). Desain frontend menggunakan skema warna brand utama **#005A9C** dan **putih** (`#ffffff`) untuk seluruh tombol utama (`Button`), link aktif, kartu, dan elemen antarmuka. Foto tampil besar dengan huruf yang mudah dibaca. Pada tampilan mobile, menu dropdown di Navbar dibuka/ditutup memakai tombol ikon **Hamburger** (`☰` / `✕`).

| Halaman | Rute Utama (Alias Lama) | Akses |
| --- | --- | --- |
| Beranda (Hero, profil perusahaan, slideshow album, video) | `/` | Publik |
| Galeri album (semua album, foto kenangan, dan modal perbesar foto) | `/gallery` (`/galeri`) | Publik |
| Daftar | `/register` (`/daftar`) | Tamu saja (`GuestRoute`) |
| Login | `/login` (`/masuk`) | Tamu saja (`GuestRoute`) |
| Daftar member (input pencarian langsung + kartu biodata) | `/members` (`/warga`) | User, admin (`ProtectedRoute`) |
| Detail member | `/members/:id` (`/warga/:id`) | User, admin (`ProtectedRoute`) |
| Dashboard admin (tabel biodata) | `/admin` | Admin (`AdminRoute`) |
| Form tambah biodata | `/admin/members/new` (`/admin/warga/baru`) | Admin (`AdminRoute`) |
| Form ubah biodata | `/admin/members/:id/edit` (`/admin/warga/:id/ubah`) | Admin (`AdminRoute`) |
| Halaman tidak ditemukan | `*` | Publik |
| Kelola album (buat album baru 1–50 foto, tombol tambah foto terpisah, ubah judul/urutan/hapus foto album, hapus album) | `/admin/albums` (`/admin/album`) | Admin (`AdminRoute`) |
| Kelola video (lihat video saat ini, tempel link YouTube untuk mengganti, hapus) | `/admin/video` | Admin (`AdminRoute`) |
| Kelola akun user (tabel akun, hapus akun) | `/admin/users` (`/admin/akun`) | Admin (`AdminRoute`) |

**Aturan UI**

- Desain mobile first; layout kartu 1 kolom di HP, 3 kolom di desktop.
- Setiap halaman punya tiga kondisi: loading, error, dan data kosong.
- Hasil aksi (berhasil atau gagal) selalu ditampilkan lewat toast.
- Pesan error form muncul di bawah kolom yang salah.
- Semua gaya memakai kelas Tailwind; jangan membuat file CSS sendiri selain `index.css` (impor Tailwind dan tema warna brand #005A9C dan putih).
- Palet warna desain frontend: latar dan permukaan menggunakan warna **#005A9C** dan **putih** (`#ffffff`); tombol utama (`Button`), link aktif, dan aksen menggunakan `#005A9C`. Aksi destruktif (hapus) menggunakan warna merah standar.

## Tech Stack dan Fungsi Library

Semua kode memakai TypeScript. Jangan menambah library di luar daftar ini tanpa persetujuan.

| Library | Dipakai di | Fungsi |
| --- | --- | --- |
| React + Vite | Frontend | Membangun halaman |
| React Router | Frontend | Perpindahan halaman dan route terlindungi |
| TanStack Query | Frontend | Mengambil dan menyimpan cache data dari API |
| Zustand | Frontend | Menyimpan state login (token dan data user); middleware `persist` bawaan menyimpannya di `localStorage` |
| React Hook Form | Frontend | Mengelola form |
| @hookform/resolvers | Frontend | Menghubungkan skema Zod ke React Hook Form |
| Zod | Frontend dan backend | Validasi data (satu skema per form atau endpoint) |
| react-hot-toast | Frontend | Notifikasi berhasil atau gagal |
| Express | Backend | Server API |
| cors | Backend | Membatasi akses API hanya dari `CLIENT_URL` |
| mysql2 | Backend | Koneksi dan query MySQL |
| dotenv | Backend | Membaca konfigurasi dari `.env` |
| jsonwebtoken | Backend | Membuat dan memeriksa token login |
| bcrypt | Backend | Hash password |
| multer | Backend | Menerima upload foto di memori lalu diteruskan ke Cloudinary (hanya admin) |
| Embla Carousel (embla-carousel-react + embla-carousel-autoplay) | Frontend | Slideshow album di beranda: ringan, tanpa dependensi lain, mendukung sentuhan dan keyboard |
| Tailwind CSS (plugin Vite resmi @tailwindcss/vite) | Frontend | Semua styling memakai kelas utility, tanpa file CSS sendiri selain satu file masuk |
| cloudinary (SDK Node) | Backend | Mengunggah dan menghapus foto di Cloudinary (penyimpanan foto gratis) |

Tanpa library tambahan: pergantian foto di halaman detail memakai state React dan Tailwind; video memakai iframe YouTube dari `youtube-nocookie.com` dengan `loading="lazy"`.

## Struktur Folder

Satu repo, dua folder utama. Ikuti nama persis seperti di bawah.

```text
warga-halim/
├── .gitignore
├── README.md
├── client/                      # FRONTEND (dikerjakan dulu)
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vercel.json              # rewrite SPA untuk deploy Vercel
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── routes/              # definisi route + GuestRoute, ProtectedRoute, AdminRoute
│       ├── pages/               # satu file per halaman
│       ├── components/          # komponen kecil yang dipakai ulang
│       │   ├── ui/              # Button, Input, PasswordInput, Card, Spinner
│       │   └── layout/          # Navbar, NavbarAuthActions, Footer, PageLayout
│       ├── features/
│       │   ├── auth/            # form login/daftar (+ confirmPassword), hook, schema zod
│       │   ├── warga/           # kartu (1 foto), galeri foto detail (tanpa thumbnail), form biodata, hook query
│       │   ├── beranda/         # HomeHero, slideshow album, pemutar video, hook query
│       │   └── galeri/          # halaman galeri semua album, hook query
│       ├── services/            # fungsi pemanggil API (api.ts, authService.ts, wargaService.ts)
│       ├── store/               # authStore.ts (zustand)
│       ├── mocks/               # data dummy untuk tahap frontend
│       ├── content/             # profil perusahaan (teks statis, tanpa database)
│       ├── types/               # tipe TypeScript bersama
│       └── styles/             # index.css: impor Tailwind dan tema warna
└── server/                      # BACKEND (dikerjakan setelah frontend)
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    ├── vercel.json              # konfigurasi serverless Express di Vercel
    ├── uploads/                 # tidak dipakai jika foto di Cloudinary (multer memakai memori)
    ├── sql/
    │   └── schema.sql           # CREATE TABLE
    └── src/
        ├── index.ts             # titik masuk server
        ├── app.ts               # setup express
        ├── config/              # env.ts (baca dan validasi .env), db.ts, cloudinary.ts
        ├── routes/              # public.routes.ts, auth.routes.ts, warga.routes.ts, admin.routes.ts
        ├── controllers/         # menerima request, memanggil service
        ├── services/            # logika bisnis, query database, dan upload Cloudinary
        ├── middlewares/         # auth, role, errorHandler, upload
        ├── schemas/             # skema zod
        ├── types/               # auth.ts, models.ts
        ├── scripts/
        │   ├── init-db.ts       # inisialisasi database & tabel dari sql/schema.sql
        │   └── seed-admin.ts    # membuat akun admin dari .env
        └── utils/               # AppError.ts, dbHelpers.ts
```

Alur backend selalu satu arah: route, lalu controller, lalu service, lalu database.

## Database

MySQL dengan enam tabel. Query memakai placeholder `?` dari mysql2, jangan menyambung string SQL.

**Tabel `users`**

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | INT, PK, auto increment |  |
| name | VARCHAR(100) | Nama akun |
| username | VARCHAR(100), unik | Username login akun (min 3 karakter) |
| password\_hash | VARCHAR(255) | Hasil bcrypt, bukan password asli |
| role | ENUM('admin','user') | Default `user` |
| created\_at | TIMESTAMP |  |

**Tabel `warga`**

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | INT, PK, auto increment |  |
| full\_name | VARCHAR(150) | Wajib |
| position | VARCHAR(100) | Posisi / jabatan terakhir, wajib |
| birth\_date | DATE | Tanggal lahir, wajib |
| domicile | VARCHAR(150) | Domisili tinggal, wajib |
| whatsapp\_number | VARCHAR(100) | No. WhatsApp, opsional |
| social\_media | VARCHAR(255) | Akun media sosial, opsional |
| message\_impression | TEXT | Pesan dan kesan, maksimal 1000 karakter, boleh kosong |
| created\_at, updated\_at | TIMESTAMP |  |

**Tabel `warga_photos`** (3 sampai 10 baris per orang; jumlahnya dicek di backend)

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | INT, PK, auto increment |  |
| warga\_id | INT, FK ke `warga.id` | ON DELETE CASCADE: hapus biodata, fotonya ikut terhapus |
| photo\_url | VARCHAR(255) | Alamat foto di Cloudinary |
| public\_id | VARCHAR(255) | ID file di Cloudinary, dipakai saat menghapus foto |
| sort\_order | SMALLINT | Urutan foto; urutan 1 menjadi foto kartu |

**Tabel `videos`** (paling banyak 1 baris: menyimpan video baru menghapus video lama)

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | INT, PK, auto increment |  |
| title | VARCHAR(100) | Judul video |
| youtube\_url | VARCHAR(255) | Link YouTube, divalidasi dengan Zod |
| created\_at | TIMESTAMP | Waktu video dipasang |

**Tabel `albums`** (album umum/bersama, tidak terhubung ke `warga`)

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | INT, PK, auto increment |  |
| title | VARCHAR(100) | Nama album |
| created\_at | TIMESTAMP |  |

**Tabel `album_photos`**

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | INT, PK, auto increment |  |
| album\_id | INT, FK ke `albums.id` | ON DELETE CASCADE: hapus album, fotonya ikut terhapus |
| photo\_url | VARCHAR(255) |  |
| public\_id | VARCHAR(255) | ID file di Cloudinary, dipakai saat menghapus foto |
| sort\_order | SMALLINT | Urutan dalam album |

## API

Semua endpoint diawali `/api`. Token dikirim lewat header `Authorization: Bearer <token>`.

| Method | Path | Akses | Fungsi |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Publik | Daftar user baru |
| POST | `/api/auth/login` | Publik | Login, mengembalikan token dan data user |
| GET | `/api/auth/me` | Login | Data user dari token |
| GET | `/api/warga?search=` | Login | Daftar biodata (hanya foto pertama tiap orang) |
| GET | `/api/warga/:id` | Login | Detail biodata beserta semua fotonya |
| POST | `/api/admin/warga` | Admin | Tambah biodata (form-data + 3 sampai 10 foto, field photos) |
| PUT | `/api/admin/warga/:id` | Admin | Ubah biodata (termasuk tambah, hapus, atau urutkan ulang foto) |
| DELETE | `/api/admin/warga/:id` | Admin | Hapus biodata |
| GET | `/api/admin/users` | Admin | Daftar akun dengan role user |
| DELETE | `/api/admin/users/:id` | Admin | Hapus akun user (akun admin tidak bisa dihapus) |
| GET | /api/home | Publik | Data beranda: album beserta foto dan satu video (atau null) |
| POST | /api/admin/albums | Admin | Buat album baru dan upload foto-fotonya (1 sampai 50 foto) |
| PUT | /api/admin/albums/:id | Admin | Ubah album (judul, urutkan/hapus foto lama) |
| POST | /api/admin/albums/:id/photos | Admin | Tambah foto ke album yang sudah ada (maksimal akumulasi 50 foto per album) |
| DELETE | /api/admin/albums/:id | Admin | Hapus album beserta fotonya |
| POST | /api/admin/videos | Admin | Simpan judul dan link YouTube; mengganti video lama jika ada |
| DELETE | /api/admin/videos/:id | Admin | Hapus video |
| GET | /api/albums | Publik | Semua album beserta fotonya (halaman galeri) |

Format error seragam: `{ "message": "teks untuk pengguna" }` dengan kode HTTP yang tepat (400, 401, 403, 404, 500).

## Keamanan dan Credential

Tidak boleh ada credential di repo: tidak di kode, tidak di dokumen, tidak di riwayat commit.

1. Semua rahasia hanya ada di file `.env` lokal (`server/.env`, `client/.env`). File ini wajib masuk `.gitignore`.
2. Yang di-commit hanya `.env.example` berisi nama variabel dengan nilai kosong atau contoh palsu.
3. Variabel backend: `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, CLOUDINARY\_CLOUD\_NAME, CLOUDINARY\_API\_KEY, CLOUDINARY\_API\_SECRET.
4. Variabel frontend: `VITE_API_URL` saja. Variabel berawalan `VITE_` terlihat publik, jangan isi rahasia.
5. Akun admin dibuat oleh `npm run seed:admin`, yang membaca `ADMIN_USERNAME` (atau `ADMIN_EMAIL`) dan `ADMIN_PASSWORD` dari `.env`, lalu menyimpan hasil bcrypt. Username admin: `admin`. Password diisi pemilik proyek di `.env` sendiri.
6. `.gitignore` minimal memuat: `.env`, `.env.*` (kecuali `.env.example`), `node_modules`, `dist`, `server/uploads/*` (kecuali `.gitkeep`), `*.log`.
7. Password disimpan hanya sebagai hash bcrypt (cost 10 atau lebih). JWT berlaku 1 hari.
8. Aktifkan `cors` hanya untuk `CLIENT_URL`. Cek role admin di backend, bukan hanya menyembunyikan menu di frontend.
9. Upload foto: hanya jpg, png, atau webp, maksimal 2 MB, nama file diganti acak. Video tidak diunggah: admin menempel link YouTube (hanya domain youtube.com atau youtu.be) dan video ditampilkan lewat iframe youtube-nocookie.com.
10. Sebelum push pertama, jalankan `git status` dan pastikan tidak ada file `.env` di daftar.

Password awal admin sebaiknya diganti dengan yang lebih kuat sebelum website dipublikasikan.

**Catatan deployment:** folder `server/uploads/` tidak bisa dipakai di Vercel karena penyimpanannya tidak permanen; seluruh foto disimpan di Cloudinary (kunci Cloudinary hanya disimpan di environment variables backend, bukan frontend). Target deployment yang dipilih:

- **Frontend (`client/`):** Deploy ke **Vercel** dengan SPA rewrite di `client/vercel.json`; set environment variable `VITE_API_URL` menuju URL backend Vercel (contoh: `https://<backend-domain>.vercel.app/api`).
- **Backend (`server/`):** Deploy ke **Vercel** melalui `server/vercel.json` dan `export default app` di `server/src/index.ts`; set seluruh variabel dari `server/.env.example` (`CLIENT_URL` ke URL frontend Vercel, kredensial Railway MySQL, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan kredensial Cloudinary).
- **Database MySQL:** Di-host di **Railway MySQL**. Sebelum produksi, jalankan `npm run db:init` dan `npm run seed:admin` dengan nilai `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` dari Railway MySQL.

## Urutan Pengerjaan

Frontend dikerjakan penuh dengan data dummy sebelum backend dimulai. Selesaikan satu tahap, centang, baru lanjut.

**Tahap A: Frontend (folder `client/`)**

- [x] A1. Buat project Vite + React + TypeScript, pasang library (termasuk Tailwind CSS), buat `.gitignore` dan `.env.example`.
- [x] A2. Buat struktur folder, layout (Navbar, Footer), dan routing semua halaman.
- [x] A3. Buat komponen UI dasar: Button, Input, Card, Spinner, dan kondisi kosong.
- [x] A4. Buat halaman Beranda dengan profil perusahaan singkat (teks statis, tanpa database). Tambahkan slideshow album dan video dengan data dummy.
- [x] A5. Buat form Daftar dan Login (React Hook Form + Zod + @hookform/resolvers, nama min 6, username min 3, password min 8, tombol tampilkan password), simpan state di Zustand dengan `persist` (tetap login setelah refresh) memakai data dummy.
- [x] A6. Buat `ProtectedRoute` dan `AdminRoute` berdasarkan state login.
- [x] A7. Buat halaman daftar warga, pencarian, dan detail, kartu hanya 1 foto, dan di detail foto bisa diklik untuk berganti (data dari `mocks/`).
- [x] A8. Buat dashboard admin dan form tambah atau ubah biodata (termasuk pilih 3 sampai 10 foto dan atur urutannya). Tambahkan halaman admin untuk kelola album, kelola satu video, dan kelola akun user (`/admin/akun`).
- [x] A9. Pasang toast untuk semua aksi, lalu cek tampilan di ukuran HP.
- [x] A10. Pindahkan pemanggilan data ke `services/` + TanStack Query, masih memakai mock.

**Tahap B: Backend (folder `server/`)**

- [x] B1. Buat project Express + TypeScript, `config/env.ts` (validasi `.env` dengan Zod), `app.ts` (termasuk `cors` hanya untuk `CLIENT_URL`), dan error handler.
- [x] B2. Buat `sql/schema.sql` dan koneksi MySQL (`config/db.ts`).
- [x] B2a. BERHENTI: tanyakan ke pemilik proyek dulu sebelum mengerjakan Cloudinary dan tunggu jawabannya. Setelah dijawab, buat akun Cloudinary gratis, isi kuncinya di `server/.env`, lalu buat service upload foto (multer memori + SDK Cloudinary).
- [x] B3. Buat register dan login (bcrypt + JWT) dan middleware auth dan role.
- [x] B4. Buat `seed-admin.ts` yang membaca `ADMIN_USERNAME` dan `ADMIN_PASSWORD` dari `.env`.
- [x] B5. Buat endpoint warga (daftar, detail) dan endpoint admin (tambah, ubah, hapus, upload 3 sampai 10 foto), endpoint album dan video (satu video), endpoint kelola akun user, serta endpoint beranda.
- [x] B6. Uji tiap endpoint dengan alat seperti Postman atau curl.

**Tahap C: Integrasi**

- [x] C1. Ganti mock di `services/` dengan panggilan API sungguhan.
- [x] C2. Uji alur user dan alur admin dari awal sampai akhir.
- [x] C3. Cek ulang `git status` dan pastikan tidak ada credential sebelum push.

## Aturan untuk Programmer Junior dan AI Model

- Kerjakan satu tugas dari daftar tahap dalam satu waktu; jangan loncat tahap.
- Gunakan hanya library pada tabel tech stack.
- Satu file, satu tanggung jawab. Komponen React lebih dari sekitar 150 baris dipecah.
- Gunakan TypeScript ketat: dilarang `any`, buat tipe di `types/`.
- Validasi semua input dengan Zod, di frontend (form) dan di backend (request).
- Jangan menulis password, secret, atau token di kode. Selalu baca dari `.env`.
- Nama file komponen `PascalCase.tsx`, file lain `camelCase.ts`, kolom database `snake_case`.
- Teks yang dilihat pengguna ditulis dalam **bahasa Indonesia**, nama variabel dan fungsi dalam bahasa Inggris.
- Bila ada hal yang tidak jelas atau bingung, berhenti dan tanyakan ke pemilik proyek; jangan menebak. Tulis maksimal 3 pertanyaan singkat, beri pilihan jawaban jika bisa, lalu tunggu jawaban sebelum lanjut.
- Setelah selesai satu tahap, jalankan aplikasi dan pastikan tidak ada error di konsol sebelum lanjut.

**Titik wajib bertanya:** pada tahap berikut, berhenti dan tanyakan ke pemilik proyek sebelum mengerjakan apa pun.

| Tahap | Tanyakan dulu |
| --- | --- |
| B2a, Cloudinary | Apakah akun Cloudinary sudah dibuat dan kuncinya siap? Apakah tetap memakai Cloudinary? |
| B4, seed admin | Password admin yang diisi di `server/.env` |
| Sebelum deploy | Tempat deploy frontend, backend, dan database MySQL |
| Fitur atau library di luar PRD | Apa yang ingin ditambah dan alasannya |

## Kriteria Selesai

- [x] Pengunjung yang belum login tidak bisa membuka `/members` maupun `/members/:id` (dan alias `/warga*`), serta user yang sudah login tidak bisa mengakses `/login` (`/masuk`) maupun `/register` (`/daftar`).
- [x] User baru bisa daftar (termasuk validasi re-enter password), login, mencari nama, dan melihat detail biodata.
- [x] Admin `admin` bisa login, lalu tambah, ubah, hapus biodata dan upload 3 sampai 10 foto.
- [x] User biasa tidak bisa membuka `/admin` maupun memanggil `/api/admin/*` (hasilnya 403).
- [ ] Sekitar 25 biodata mantan karyawan sudah terisi dengan foto.
- [x] Tidak ada credential di repo; `.env.example` ada dan `.env` diabaikan git.
- [x] Tampilan nyaman di HP (dengan tombol menu ikon Hamburger pada Navbar mobile) dan desktop, semua teks antarmuka berbahasa Indonesia dengan tema warna brand #005A9C dan white.
- [ ] Target awal: minimal 10 mantan karyawan sudah mendaftar.
- [x] Halaman galeri (`/gallery`, alias `/galeri`) bisa dibuka tanpa login, menampilkan semua album, dan foto dapat diklik untuk memperbesar gambar (*lightbox preview*).
- [x] Kartu biodata hanya menampilkan 1 foto; di halaman detail foto utama besar bisa diklik untuk berganti tanpa deretan thumbnail di bawahnya, pesan & kesan tampil rapi, dan biodata ditolak jika fotonya kurang dari 3 atau lebih dari 10.
- [x] Hero homepage berlatar gambar perkantoran, slideshow album, dan video tampil di beranda untuk pengunjung tanpa login.
- [x] Pesan dan kesan hanya bisa diisi dan diubah admin; user tidak punya form maupun endpoint untuk menulisnya.
- [x] Album bersifat umum (bukan per karyawan) dan tidak tampil di halaman detail member.
- [x] Admin bisa mengelola album (membuat album baru 1–50 foto, tombol tambah foto baru terpisah dari form ubah album hingga total 50 foto, mengubah judul dan urutan/hapus foto lama, serta menghapus album).
- [x] Beranda hanya menampilkan satu video YouTube; memasang video baru mengganti video lama.
- [x] Admin bisa melihat daftar akun user dan menghapusnya di `/admin/users` (alias `/admin/akun`); akun yang dihapus tidak bisa login lagi.
- [x] Daftar akun menolak nama kurang dari 6 karakter, username kurang dari 3 karakter atau berbentuk email ("Username tidak valid"), password kurang dari 8 karakter, dan re-enter password yang tidak cocok; kolom password punya tombol tampilkan password.
- [x] Setelah halaman di-refresh, user tetap dalam keadaan login selama token masih berlaku.
- [x] Biodata ditolak jika posisi (`position`) kosong.
