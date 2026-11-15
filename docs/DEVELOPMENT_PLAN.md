# Development Plan — Warga Halim

Sumber kebenaran: [`PRD.md`](./PRD.md). Dokumen ini menerjemahkan PRD menjadi langkah kerja. Jika ada perbedaan antara dokumen ini dan PRD, **PRD yang benar** — berhenti dan tanyakan ke pemilik proyek.

Dokumen terkait:
- [`DATABASE_DESIGN.md`](./DATABASE_DESIGN.md) — tabel dan relasi.
- [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) — kontrak endpoint.

---

## 1. Ringkasan Aplikasi

Warga Halim adalah website kenangan untuk ±25 mantan karyawan perusahaan yang sudah bubar.

| Siapa | Bisa apa |
| --- | --- |
| Pengunjung (belum login) | Lihat beranda (profil perusahaan, slideshow album, 1 video), lihat galeri album, daftar, login |
| User (mantan karyawan) | Semua yang bisa pengunjung + lihat daftar dan detail biodata warga (**hanya membaca**) |
| Admin (1 akun, `admin@warga.co`) | Semua yang bisa user + kelola biodata (termasuk foto dan **pesan & kesan**), kelola album, kelola 1 video, kelola akun user |

### 1.1 Aturan penting yang sering salah dipahami

> **Aturan 1 — Pesan dan kesan HANYA diisi admin.**
> - Field `message_impression` hanya ada di form biodata admin (`/admin/members/new` alias `/admin/warga/baru` dan `/admin/members/:id/edit` alias `/admin/warga/:id/ubah`).
> - User **tidak** punya form, tombol, atau endpoint untuk menulis/mengubahnya. User hanya **membaca** di `/members/:id` (`/warga/:id`).

> **Aturan 2 — Semua foto HANYA diunggah admin.**
> - Foto biodata dan foto album diunggah lewat halaman admin. User tidak punya form atau endpoint upload.

> **Aturan 3 — Album itu umum, BUKAN per karyawan.**
> - Album = kumpulan foto kenangan bersama. Tidak ada `warga_id` di tabel album. Detail member **tidak** menampilkan album.
> - Foto biodata adalah hal yang **berbeda**: tetap sesuai PRD (3–10 foto per orang, foto urutan 1 = foto kartu, di detail hanya foto utama besar yang bisa diklik berganti tanpa thumbnail di bawahnya).

> **Aturan 4 — Hanya ada SATU video.**
> - Website menyimpan paling banyak 1 video YouTube. Admin memasang video baru → video lama otomatis diganti.
> - Admin bisa menghapus video. Jika tidak ada video, bagian video di beranda disembunyikan.

| | Foto biodata (`warga_photos`) | Foto album (`album_photos`) |
| --- | --- | --- |
| Milik siapa | Satu orang member | Album umum (bersama) |
| Jumlah | Wajib 3–10 per orang | Minimal 1 (lihat §8) |
| Tampil di | Kartu `/members` (foto 1 saja), detail `/members/:id` (foto utama klik untuk berganti) | Slideshow beranda `/`, galeri `/gallery` (`/galeri`) |
| Perlu login untuk melihat | Ya | Tidak |
| Yang mengunggah | Admin | Admin |

---

## 2. Prinsip Kerja

1. **Urutan wajib:** Tahap A (frontend + data dummy) → Tahap B (backend) → Tahap C (integrasi). Jangan loncat.
2. **Satu tugas dalam satu waktu.** Selesai → jalankan aplikasi → pastikan konsol tanpa error → centang → lanjut.
3. **Jangan menambah fitur atau library di luar PRD.** Jika ragu, berhenti dan tanya (maksimal 3 pertanyaan singkat, beri pilihan jawaban).
4. **Teks UI berbahasa Indonesia** (rute utama bahasa Inggris dan alias rute lama bahasa Indonesia didukung), nama variabel/fungsi berbahasa Inggris.
5. **TypeScript ketat**, dilarang `any`. Tipe bersama di `client/src/types/`.
6. **Validasi semua input dengan Zod** di frontend (form) dan backend (request).
7. **Tidak ada credential di kode.** Semua rahasia dari `.env`.

---

## 3. Tech Stack (terkunci)

| Layer | Library | Dipakai untuk |
| --- | --- | --- |
| Frontend | React + Vite | Membangun halaman |
| Frontend | React Router | Routing, `GuestRoute`, `ProtectedRoute`, `AdminRoute` |
| Frontend | TanStack Query | Ambil & cache data API |
| Frontend | Zustand (+ middleware `persist` bawaan) | State login; disimpan di `localStorage` agar tetap login setelah refresh |
| Frontend | React Hook Form | Form |
| Frontend | @hookform/resolvers | Menghubungkan skema Zod ke React Hook Form (`zodResolver`) |
| Frontend + Backend | Zod | Validasi |
| Frontend | react-hot-toast | Notifikasi hasil aksi |
| Frontend | Embla Carousel (`embla-carousel-react` + `embla-carousel-autoplay`) | Slideshow album beranda |
| Frontend | Tailwind CSS (`@tailwindcss/vite`) | Semua styling |
| Backend | Express | Server API |
| Backend | cors | Membatasi akses API hanya dari `CLIENT_URL` |
| Backend | mysql2 | Query MySQL (placeholder `?`) |
| Backend | dotenv | Baca `.env` |
| Backend | jsonwebtoken | Token login (berlaku 1 hari) |
| Backend | bcrypt | Hash password (cost ≥ 10) |
| Backend | multer | Terima upload foto di memori |
| Backend | cloudinary | Simpan & hapus foto |

Tanpa library tambahan:
- Pergantian foto di detail warga → `useState` + Tailwind.
- Tombol tampilkan/sembunyikan password → `useState` mengganti `type="password"` ↔ `type="text"`.
- Video → `<iframe>` dari `youtube-nocookie.com` dengan `loading="lazy"`.

---

## 4. Struktur Folder

Ikuti persis struktur di PRD bagian "Struktur Folder". Ringkasan:

```text
warga-halim/
├── client/src/
│   ├── routes/        # route + GuestRoute, ProtectedRoute, AdminRoute
│   ├── pages/         # satu file per halaman
│   ├── components/ui/ # Button, Input, PasswordInput, Card, Spinner
│   ├── components/layout/ # Navbar, NavbarAuthActions, Footer, PageLayout
│   ├── features/      # auth, warga, beranda (HomeHero, slideshow, video), galeri
│   ├── services/      # fungsi pemanggil API (awalnya mock)
│   ├── store/         # authStore.ts (Zustand + persist)
│   ├── mocks/         # data dummy
│   ├── content/       # profilPerusahaan.ts (teks statis)
│   ├── types/
│   └── styles/        # index.css (satu-satunya file CSS)
└── server/src/
    ├── config/        # env.ts, db.ts, cloudinary.ts
    ├── routes/ → controllers/ → services/ → database   (alur satu arah: public, auth, warga, admin)
    ├── middlewares/   # auth, role, errorHandler, upload
    ├── schemas/       # zod
    ├── types/         # auth.ts, models.ts
    ├── utils/         # AppError.ts, dbHelpers.ts
    └── scripts/       # init-db.ts, seed-admin.ts
```

Aturan penamaan: komponen `PascalCase.tsx`, file lain `camelCase.ts`, kolom database `snake_case`. Komponen > ±150 baris dipecah.

---

## 5. Halaman dan Akses

| Rute Utama (Alias Lama) | Halaman | Akses | Isi utama |
| --- | --- | --- | --- |
| `/` | Home | Publik | Hero banner berlatar gambar perkantoran, profil perusahaan (statis), slideshow album, 1 video (jika ada) |
| `/gallery` (`/galeri`) | Gallery | Publik | Semua album beserta fotonya |
| `/register` (`/daftar`) | Register | Tamu saja (`GuestRoute`) | Card 2 kolom: form nama (min 6), email, password (min 8, Show/Hide), re-enter password di kiri + kolom tipografi menyatu di kanan |
| `/login` (`/masuk`) | Login | Tamu saja (`GuestRoute`) | Card 2 kolom: form email, password (Show/Hide) di kiri (Admin → `/admin`, user → `/members`) + kolom tipografi menyatu di kanan |
| `/members` (`/warga`) | Members Directory | User, admin | Kartu (1 foto = foto urutan 1) + pencarian nama |
| `/members/:id` (`/warga/:id`) | Member Detail | User, admin | Nama, badge jabatan & kontak (opsional), Pesan & Kesan (**baca saja**), foto utama klik untuk berganti (3–10 foto, tanpa thumbnail di bawah) |
| `/admin` | Admin Dashboard | Admin | Tabel biodata (ubah/hapus) + menu ke halaman admin lain |
| `/admin/members/new` (`/admin/warga/baru`) | Create Member | Admin | Form biodata + pesan & kesan + 3–10 foto + urutan |
| `/admin/members/:id/edit` (`/admin/warga/:id/ubah`) | Edit Member | Admin | Sama seperti tambah, termasuk tambah/hapus/urutkan foto |
| `/admin/albums` (`/admin/album`) | Manage Albums | Admin | Tambah album + upload foto, hapus album |
| `/admin/video` | Manage Video | Admin | Lihat video saat ini, form judul + link YouTube (mengganti video lama), hapus |
| `/admin/users` (`/admin/akun`) | Manage Users | Admin | Tabel akun role `user` (nama, email, tanggal daftar) + tombol hapus dengan konfirmasi |
| `*` | 404 | Publik | Halaman tidak ditemukan |

Aturan UI wajib:
- Mobile first: kartu 1 kolom di HP, 3 kolom di desktop. Tabel admin harus bisa digeser horizontal di HP. Navigasi mobile memakai tombol ikon **Hamburger** (`☰` / `✕`), bukan tombol teks `"Menu"`.
- Setiap halaman punya kondisi **loading**, **error**, dan **data kosong**.
- Hasil aksi selalu lewat **toast** berbahasa Indonesia. Error form muncul di bawah kolom yang salah.
- Aksi hapus (biodata, album, video, akun) selalu minta konfirmasi dulu.
- Desain warna frontend: dominan warna brand **#005A9C** dan **white** (`#ffffff`) untuk seluruh tombol, link, aksen, latar, dan kartu. Foto besar dan huruf mudah dibaca.

### 5.1 Alur login & sesi

1. Login berhasil → simpan `token` + `user` di Zustand. Middleware `persist` otomatis menyimpannya di `localStorage` (key: `warga-halim-auth`).
2. Halaman di-refresh → Zustand memuat ulang dari `localStorage` → user tetap login.
3. Saat aplikasi pertama dibuka dan ada token → panggil `GET /api/auth/me`.
   - Berhasil → perbarui data user.
   - 401 (token kedaluwarsa atau akun sudah dihapus admin) → hapus state, arahkan ke `/login`, tampilkan toast `"Session expired, please sign in again."`.
4. Selama memeriksa token, `GuestRoute`/`ProtectedRoute`/`AdminRoute` menampilkan Spinner (jangan langsung redirect).
5. Setiap response 401 dari API → perlakuan sama seperti poin 3.
6. Logout → hapus state Zustand (otomatis terhapus dari `localStorage`), arahkan ke `/`. Tidak ada endpoint logout.
7. Belum login membuka `/members*` (`/warga*`) → diarahkan ke `/login`. Sudah login membuka `/login`, `/masuk`, `/register`, atau `/daftar` (`GuestRoute`) → otomatis diarahkan ke `/admin` (jika admin) atau `/members` (jika user). Bukan admin membuka `/admin*` → diarahkan ke `/members`.

### 5.2 Detail komponen penting

**Hero beranda (`HomeHero.tsx`):** beranda (`/`) memakai layout `<main>` penuh tanpa padding luar sehingga `Navbar`, `HomeHero` (berlatar **gambar perkantoran** dengan overlay gelap ke biru langit, headline besar, pill badge, dan CTA pill menuju `/gallery` & `/members`, tanpa bar putih bawah seperti `docs/pict/bar.png`), dan section *Company Profile* (`About Warga Halim`, `bg-white`) menyatu di bagian atas pada lebar penuh (`w-full`); sedangkan `AlbumSlideshow` dan `FeaturedVideo` dibungkus dalam section berlatar gradasi biru langit yang berbeda dengan lebar terpusat **80%** (`md:w-[80%] mx-auto`, tidak `w-full`).

**Slideshow beranda (Embla):** memutar foto dari banyak album, ganti tiap 5 detik, berhenti saat disentuh/di-hover, judul album di bawah foto, tombol sebelumnya/berikutnya.

**Video beranda:** satu video, iframe `youtube-nocookie.com`, `loading="lazy"`. Jika `video` dari API `null`, bagian ini tidak ditampilkan.

**Galeri foto detail member:** hanya menampilkan foto utama besar; klik foto → foto berikutnya (**tanpa** deretan thumbnail kecil di bawah foto utama). Info kota/kontak ditampilkan dengan pill badge dan bagian *Message & Impression* ditata sebagai kartu kutipan yang rapi. Pakai `useState`.

**PasswordInput:** komponen Input dengan tombol "Show"/"Hide" yang mengganti `type` input. Dipakai di `/register` (Password & Re-enter Password) dan `/login`.

**Form biodata admin:**

| Field | Aturan |
| --- | --- |
| Nama lengkap (`full_name`) | Wajib, maks 150 |
| Kota domisili (`city`) | **Wajib**, maks 100 |
| Kontak (`contact`) | Opsional, maks 150 |
| Pesan & kesan (`message_impression`) | Opsional, textarea, maks 1000 (tampilkan penghitung karakter) |
| Foto | Wajib 3–10, jpg/png/webp, ≤ 2 MB per foto, urutan bisa diatur, foto pertama = foto kartu |

**Form daftar:**

| Field | Aturan |
| --- | --- |
| Nama (`name`) | Wajib, **minimal 6**, maks 100 karakter |
| Email | Wajib, format email, maks 150 |
| Password | Wajib, **minimal 8** karakter, ada tombol Show/Hide |
| Re-enter Password (`confirmPassword`) | Wajib diisi dan **harus cocok** dengan `password` (validasi Zod `.refine()`, ada tombol Show/Hide) |

---

## 6. Urutan Pengerjaan (Checklist)

### Tahap A — Frontend (`client/`, data dummy)

- [x] **A1.** Buat project Vite + React + TS, pasang semua library frontend (termasuk `@hookform/resolvers`) + Tailwind, buat `.gitignore` dan `client/.env.example` (`VITE_API_URL=`).
- [x] **A2.** Buat struktur folder, layout (Navbar, Footer, PageLayout), dan routing semua halaman di §5 (boleh masih kosong).
- [x] **A3.** Komponen UI dasar: Button, Input (dengan pesan error), PasswordInput (tombol tampilkan password), Card, Spinner, kondisi kosong.
- [x] **A4.** Beranda: Hero (`HomeHero.tsx` berlatar gambar perkantoran), profil perusahaan dari `content/profilPerusahaan.ts`, slideshow album + 1 video dari `mocks/`. Halaman `/gallery` (alias `/galeri`) dari mock album yang sama.
  - Mock album **tidak** punya `warga_id` (album umum). Mock video berupa 1 objek atau `null`.
- [x] **A5.** Form Daftar & Login (RHF + `zodResolver` + Zod: nama min 6, password min 8, re-enter password `confirmPassword` harus sama). Buat `authStore.ts` dengan Zustand `persist` → cek: login, refresh halaman, masih login. Sediakan contoh user `role: "user"` dan `role: "admin"` di mock.
- [x] **A6.** `GuestRoute` (blokir user yang sudah login dari `/login` & `/register`), `ProtectedRoute` (harus login), dan `AdminRoute` (harus `role === "admin"`), termasuk logika §5.1.
- [x] **A7.** `/members` (`/warga`, kartu 1 foto + pencarian nama) dan `/members/:id` (`/warga/:id`, detail + foto utama yang bisa diklik berganti tanpa thumbnail di bawahnya + tampilan *Message & Impression* yang rapi). Pesan & kesan hanya teks — **tidak ada input** di halaman ini.
- [x] **A8.** Halaman admin:
  - Dashboard tabel biodata + form tambah/ubah biodata (`/admin/members/new`, `/admin/members/:id/edit`; kota wajib, textarea pesan & kesan, 3–10 foto + urutan).
  - `/admin/albums` (alias `/admin/album`): tambah album + foto, hapus album.
  - `/admin/video`: tampilkan video saat ini, form judul + link (simpan = mengganti), hapus.
  - `/admin/users` (alias `/admin/akun`): tabel akun user + hapus dengan konfirmasi.
- [x] **A9.** Pasang toast berbahasa Indonesia untuk semua aksi, cek tampilan di ukuran HP (termasuk tombol menu Hamburger di Navbar).
- [x] **A10.** Pindahkan semua akses data ke `services/` + TanStack Query (masih mengembalikan mock). Bentuk data mock **harus sama** dengan response di `API_DOCUMENTATION.md`.

### Tahap B — Backend (`server/`)

- [x] **B1.** Project Express + TS, `config/env.ts` (validasi `.env` dengan Zod), `app.ts` (`cors({ origin: CLIENT_URL })`, `express.json()`), error handler (format `{ "message": "..." }`).
- [x] **B2.** `sql/schema.sql` (salin dari `DATABASE_DESIGN.md`) dan `config/db.ts` (pool mysql2).
- [x] **B2a. ⛔ BERHENTI.** Tanyakan ke pemilik proyek: "Apakah akun Cloudinary sudah dibuat dan kuncinya siap? Tetap memakai Cloudinary?" Tunggu jawaban. Setelah itu: multer (memori, filter jpg/png/webp, 2 MB) + service upload/hapus Cloudinary.
- [x] **B3.** Register (Zod: nama min 6, password min 8) & login (bcrypt + JWT 1 hari). Middleware `auth` (cek token **dan** user masih ada di DB → jika tidak, 401) dan `role` admin (403). Endpoint `/api/auth/*`.
- [x] **B4. ⛔ BERHENTI.** Tanyakan password admin yang akan diisi di `server/.env`. Lalu buat `scripts/seed-admin.ts` + script `npm run seed:admin`.
- [x] **B5.** Endpoint warga, admin warga (kota wajib, pesan & kesan), album, video (simpan = ganti), akun user (daftar + hapus), beranda, galeri. Lihat `API_DOCUMENTATION.md`.
- [x] **B6.** Uji tiap endpoint dengan Postman/curl, termasuk kasus gagal (400, 401, 403, 404).

### Tahap C — Integrasi

- [x] **C1.** Ganti isi `services/` dari mock ke `fetch` ke `VITE_API_URL`, kirim header `Authorization: Bearer <token>`, tangani 401 sesuai §5.1.
- [x] **C2.** Uji alur user dan admin dari awal sampai akhir (lihat §7).
- [x] **C3.** `git status` → pastikan tidak ada `.env`/credential. **⛔ Sebelum deploy:** tanyakan tempat deploy frontend, backend, dan MySQL.

---

## 7. Skenario Uji Akhir (dari Kriteria Selesai PRD)

- [x] Belum login membuka `/members` atau `/members/:id` (`/warga*`) → diarahkan ke `/login`. Sudah login membuka `/login` (`/masuk`) atau `/register` (`/daftar`) → diarahkan ke `/members` atau `/admin`.
- [x] Daftar dengan nama < 6 karakter, password < 8 karakter, atau re-enter password tidak cocok → ditolak (form dan/atau backend).
- [x] Tombol Show/Hide password bekerja di `/register` (Password & Re-enter Password) dan `/login`.
- [x] User baru bisa daftar, login, cari nama, lihat detail.
- [x] Setelah login, refresh halaman → tetap login.
- [x] User **tidak melihat** form/tombol untuk mengisi pesan & kesan atau upload foto; memanggil `/api/admin/*` sebagai user → 403.
- [x] Admin bisa login → `/admin`, tambah/ubah/hapus biodata, isi pesan & kesan, upload 3–10 foto.
- [x] Biodata dengan < 3 atau > 10 foto, atau jabatan (`position`) kosong → ditolak (form dan backend).
- [x] Kartu hanya 1 foto (urutan 1); di detail hanya foto utama besar yang bisa diklik berganti tanpa daftar thumbnail di bawah, dan *Message & Impression* tampil rapi.
- [x] `/gallery` (alias `/galeri`) bisa dibuka tanpa login dan menampilkan semua album. Album tidak muncul di detail member.
- [x] Beranda menampilkan Hero berlatar gambar perkantoran, profil perusahaan, slideshow album, dan 1 video. Admin memasang video baru → beranda menampilkan video baru, video lama hilang. Hapus video → bagian video hilang.
- [x] Admin melihat daftar akun di `/admin/users` (alias `/admin/akun`), menghapus satu akun → akun itu tidak bisa login lagi dan sesinya yang aktif berakhir.
- [x] Akun admin tidak tampil di tabel akun dan tidak bisa dihapus lewat API.
- [x] Tampilan nyaman di HP (tombol menu Hamburger pada Navbar mobile) dan desktop, semua teks antarmuka berbahasa Indonesia dengan warna brand #005A9C dan white.
- [x] Tidak ada credential di repo; `.env.example` ada, `.env` diabaikan git.
- [ ] (Target data) ±25 biodata terisi dengan foto; minimal 10 mantan karyawan mendaftar.

---

## 8. Status Temuan Requirement

### 8.1 Sudah diputuskan pemilik proyek (14 Nov 2026) — sudah masuk PRD

| # | Topik | Keputusan |
| --- | --- | --- |
| 1 | Pesan & kesan | Hanya admin yang mengisi; user hanya membaca |
| 2 | Album | Umum/bersama, bukan per karyawan. Foto biodata tetap sesuai PRD |
| 3 | Video | Hanya 1 video YouTube. Simpan baru = mengganti yang lama. Admin mengisi judul + link |
| 4 | Akun user | Halaman `/admin/akun` + endpoint backend: lihat daftar dan hapus akun user |
| 5 | Upload foto | Hanya admin |
| 6 | Kota domisili | Wajib |
| 7 | Validasi daftar | Nama min 6, password min 8 |
| 8 | Tampilkan password | Ada di form daftar & login |
| 9 | Sesi | Tetap login setelah refresh (Zustand `persist` + `localStorage`, dicek dengan `/api/auth/me`) |
| 10 | Library | `cors` dan `@hookform/resolvers` ditambahkan ke tech stack |
| 11 | Tema warna frontend | Skema warna utama **#005A9C** dan **white** (`#ffffff`); seluruh tombol utama, link, dan aksen menggunakan `#005A9C` |
| 12 | Format edit foto (`PUT /api/admin/warga/:id`) | Memakai array `photo_order` (`"existing:<id>"` & `"new:<index>"`) + file `photos` baru |
| 13 | Aturan foto album (`/admin/album`) | Minimal 1, maksimal 20 foto per album; fitur hanya buat album baru & hapus album |
| 14 | Ruang lingkup `/admin/users` (alias `/admin/akun`) | Cukup lihat daftar akun `role: "user"` dan hapus akun dengan konfirmasi |
| 15 | Bahasa UI & rute utama | Seluruh teks antarmuka, toast, dan validasi berbahasa **Indonesia**; rute utama `/gallery`, `/register`, `/login`, `/members`, `/admin/*` didukung bersama alias rute lama bahasa Indonesia |
| 16 | Desain beranda (`/`) | Bagian atas beranda (`HomeHero` berlatar **gambar perkantoran** tanpa bar putih bawah `docs/pict/bar.png` + section *Company Profile* `bg-white`) menyatu mulus dengan `Navbar` secara full-width (`w-full`, `<main>` tanpa padding luar di `/`); sedangkan `AlbumSlideshow` dan `FeaturedVideo` memakai container terpusat **80%** (`md:w-[80%] mx-auto`, tidak `w-full`) dengan latar section gradasi biru langit yang berbeda dari section sebelumnya |
| 17 | Menu mobile Navbar | Tombol dropdown mobile memakai ikon **Hamburger** (`☰` / `✕`), bukan teks `"Menu"` |
| 18 | Proteksi halaman tamu (`GuestRoute`) | User yang sudah login tidak dapat mengakses `/login` (`/masuk`) atau `/register` (`/daftar`) dan diarahkan ke `/members` atau `/admin` |
| 19 | Konfirmasi password daftar (`/register`) | Tambah input Re-enter Password (`confirmPassword`) yang harus cocok dengan `password` |
| 20 | Detail member (`/members/:id`) | Tidak menampilkan daftar thumbnail foto di bawah foto utama; tampilan *Message & Impression* dirapikan |
| 21 | Layout card `/login` & `/register` | Card 2 kolom (`max-w-4xl`): form di kolom kiri dan kolom tipografi editorial menyatu di kolom kanan (`md:grid-cols-2`) |
| 22 | Target deployment | Frontend: **Vercel** (`client/`); Backend: **Vercel** (`server/`); Database: **Railway MySQL** |
| 23 | Gambar background HomeHero & Scroll restoration | Gambar hero menggunakan `docs/pict/home.jpg` (`client/src/assets/home.jpg`), serta setiap perpindahan rute otomatis mereset scroll window ke posisi atas melalui komponen `ScrollToTop` |
| 24 | Kolom `city` diganti menjadi `position` | Di database MySQL (tabel `warga`), backend API, dan formulir frontend, field domisili (`city`) diganti menjadi jabatan/posisi terakhir (`position`), bertipe `VARCHAR(100) NOT NULL` |
| 25 | Bahasa antarmuka (UI) | Seluruh teks antarmuka, tombol, label, placeholder, notifikasi toast, dan validasi dikembalikan ke dalam **bahasa Indonesia** |
| 26 | Palet warna brand | Mengubah skema warna utama menjadi **#005A9C** dan **white** (`#ffffff`), dengan seluruh tombol utama (`Button`), link aktif, dan aksen brand menggunakan `#005A9C` |

### 8.2 Masih terbuka — jangan menebak

Semua temuan terbuka pada tahap frontend/admin sudah diputuskan oleh pemilik proyek.

### 8.3 Catatan info (tidak perlu keputusan)

- PRD menyebut "bagian Penyimpanan Foto Gratis" yang tidak ada; maksudnya Cloudinary. Folder `server/uploads/` hanya berisi `.gitkeep` (multer memakai memori).
- Logout tidak punya endpoint (JWT stateless): cukup hapus token di frontend.
- Menyimpan token di `localStorage` bisa dibaca JavaScript di halaman; risiko ini diterima sesuai keputusan "tetap login setelah refresh". Jangan pernah memakai `dangerouslySetInnerHTML` untuk teks dari database (misalnya pesan & kesan).
