# Laporan Review Kode & Daftar Isu (issue.md)
**Proyek:** Warga Halim — Portal Silaturahmi & Kenangan Alumni  
**Peran:** Senior Software Engineer / Tech Lead  
**Tanggal:** 16 November 2026  
**Referensi Spesifikasi:**
- `docs/PRD.md`
- `docs/DEVELOPMENT_PLAN.md`
- `docs/DATABASE_DESIGN.md`
- `docs/API_DOCUMENTATION.md`

---

## 1. Ringkasan Eksekutif (Executive Summary)

Sebagai Senior Software Engineer dan Tech Lead, telah dilakukan audit menyeluruh (*comprehensive code review*) terhadap seluruh arsitektur basis kode proyek **Warga Halim** (`client/` dan `server/`), skema database MySQL pada Railway, serta sinkronisasi terhadap 4 dokumen spesifikasi acuan (`PRD.md`, `DEVELOPMENT_PLAN.md`, `DATABASE_DESIGN.md`, dan `API_DOCUMENTATION.md`).

Secara keseluruhan, basis kode berada dalam kondisi **sangat sehat, terstruktur rapi, berkinerja tinggi, dan aman**. Seluruh fungsionalitas inti (MVP) telah terimplementasi penuh dengan kepatuhan tinggi terhadap aturan bisnis, arsitektur REST API, kontrol hak akses berbasis peran (RBAC), serta integritas database.

### Metrik Kesehatan Kode & Arsitektur:
- **Kepatuhan Spesifikasi (Spec Compliance):** 100% dari seluruh kriteria wajib MVP terpenuhi.
- **Keamanan & Kredensial:** 100% aman (tidak ada kebocoran rahasia/kredensial pada repositori Git; enkripsi bcrypt cost 10; proteksi JWT stateless dengan validasi eksistensi user di MySQL pada setiap request; parameterisasi kueri SQL kebal SQL Injection; sanitasi XSS via React JSX; rate limiting login).
- **Integritas Data:** Migrasi kolom `position` (jabatan) menggantikan `city` telah diterapkan tuntas di MySQL Railway tanpa data loss.
- **Kualitas Antarmuka & UX:** Tema brand konsisten pada `#005A9C` dan `white` (`#ffffff`), navigasi responsif dengan tombol Hamburger mobile, *scroll restoration* otomatis ke puncak halaman, dan seluruh teks pengguna berbahasa Indonesia yang ramah dan baku.
- **Build & Tipe:** TypeScript strict mode lolos 100% (`npm --prefix server run typecheck` 0 error; `npm --prefix client run build` selesai dalam 1.15 detik tanpa error).

---

## 2. Matriks Kepatuhan Spesifikasi Dokumen (Specification Compliance Matrix)

| # | Kebutuhan / Kriteria Spesifikasi | Sumber Dokumen | Status | Catatan Audit & Verifikasi Teknis |
|---|---|---|:---:|---|
| 1 | Proteksi rute tamu & terotentikasi (`GuestRoute`, `ProtectedRoute`, `AdminRoute`) | `PRD.md` §3, §4 | **LULUS** | Pengunjung belum login diarahkan ke `/login`. User login diblokir dari `/login` & `/register`. User biasa diblokir dari `/admin/*` (HTTP 403). |
| 2 | Registrasi user baru (nama min 6, password min 8, re-enter password cocok) & Show/Hide Password | `PRD.md` §4; `DEVELOPMENT_PLAN.md` §5 | **LULUS** | Validasi Zod form + backend aktif; komponen `PasswordInput.tsx` menangani toggle visibilitas password. |
| 3 | Login admin (`admin@warga.co`), kelola biodata warga + upload 3–10 foto | `PRD.md` §2, §3; `API_DOCUMENTATION.md` #8, #9, #10 | **LULUS** | Transaksi database atomik via `withTransaction`, upload memori Multer + Cloudinary dengan kompensasi rollback jika terjadi error. |
| 4 | Pesan & Kesan hanya diisi oleh admin; user biasa hanya membaca | `PRD.md` §4; `DATABASE_DESIGN.md` §5 | **LULUS** | Input form hanya ada di `WargaForm.tsx` admin; pada `/members/:id` dirender sebagai kartu kutipan baca-saja. Tidak ada endpoint ubah bagi user. |
| 5 | Direktori warga: kartu 1 foto (urutan #1), pencarian nama *case-insensitive* | `PRD.md` §4; `API_DOCUMENTATION.md` #6 | **LULUS** | Query SQL `p.sort_order = 1`; debounce pencarian di frontend; tombol reset pencarian interaktif. |
| 6 | Halaman detail warga (`/members/:id`): foto utama klik untuk berganti tanpa baris thumbnail | `PRD.md` §4; `DEVELOPMENT_PLAN.md` §5.2 | **LULUS** | Komponen `WargaPhotoGallery.tsx` mengelola *single-view carousel* yang berganti saat foto utama diklik. |
| 7 | Album umum bersama tanpa `warga_id`, publik tanpa login di `/gallery` | `PRD.md` §2, §4; `DATABASE_DESIGN.md` §3.4 | **LULUS** | Tabel `albums` dan `album_photos` independen dari warga; `/gallery` dapat dibuka oleh publik tanpa token autentikasi. |
| 8 | Batas 1–50 foto per album dan fitur buat album baru | `PRD.md` §4; `DEVELOPMENT_PLAN.md` §8.1 (#27) | **LULUS** | Multer batas 50 file, skema Zod `min(1).max(50)`, komponen `AlbumCreateForm.tsx` mendukung multi-upload. |
| 9 | Pemisahan tombol & fitur "+ Tambah Foto" dari form "Ubah Album" pada panel admin | `PRD.md` §4; `DEVELOPMENT_PLAN.md` §8.1 (#29) | **LULUS** | Tombol `+ Tambah Foto` membuka `AlbumAddPhotosSection.tsx` (`POST /api/admin/albums/:id/photos`). Tombol `Ubah Album` membuka `AlbumEditSection.tsx` (`PUT /api/admin/albums/:id`). Form saling menutup saat yang lain dibuka. |
| 10 | Video beranda tunggal (YouTube): simpan video baru menimpa video lama | `PRD.md` §4; `DATABASE_DESIGN.md` §3.6 | **LULUS** | Ekstraksi ID video via regex YouTube teruji; transaksi SQL `DELETE FROM videos` lalu `INSERT` dalam satu siklus atomik. |
| 11 | Admin kelola akun user (`/admin/users`), tolak hapus admin, gugurkan sesi user terhapus | `PRD.md` §3; `API_DOCUMENTATION.md` #11, #12 | **LULUS** | `DELETE FROM users WHERE id = ? AND role = 'user'`. Akun admin disembunyikan dan diproteksi. `auth.ts` memverifikasi `getUserById` setiap request (401 jika terhapus). |
| 12 | Kolom `city` diganti menjadi `position` (jabatan/posisi terakhir) | `PRD.md` §4; `DEVELOPMENT_PLAN.md` §8.1 (#24) | **LULUS** | Kolom `position VARCHAR(100) NOT NULL` terpasang di MySQL Railway; API dan UI terpadu; validasi Zod menolak string kosong. |
| 13 | Bahasa antarmuka konsisten bahasa Indonesia baku | `PRD.md` §1; `DEVELOPMENT_PLAN.md` §8.1 (#25) | **LULUS** | Seluruh tombol, label, placeholder, toast, validasi Zod, dan modal dialog berbahasa Indonesia. |
| 14 | Tema warna brand **#005A9C** dan **white** (`#ffffff`) | `PRD.md` §5; `DEVELOPMENT_PLAN.md` §8.1 (#26) | **LULUS** | Token Tailwind v4 `--color-sky-primary: #005A9C`, `--color-sky-dark: #004578`, kartu putih, aksen border langit lembut. |
| 15 | Hero beranda berlatar gambar perkantoran menyatu mulus (full-width) tanpa bar putih | `PRD.md` §4; `DEVELOPMENT_PLAN.md` §5.2 | **LULUS** | `HomeHero.tsx` full-width dengan overlay gelap-ke-biru langit, headline kontras, tombol CTA pil tanpa bar putih bawah. |
| 16 | Section slideshow & video terpusat lebar 80% dengan latar gradasi biru langit | `PRD.md` §4; `DEVELOPMENT_PLAN.md` §5.2 | **LULUS** | Container `md:w-[80%] mx-auto` dengan background gradasi `from-sky-light via-white to-sky-soft` terpisah elegan dari Hero. |
| 17 | Menu navigasi mobile menggunakan ikon Hamburger (`☰` / `✕`) | `PRD.md` §5; `DEVELOPMENT_PLAN.md` §5 | **LULUS** | Tombol Hamburger interaktif dengan state `isMenuOpen`, atribut ARIA `aria-expanded` & `aria-label`. |
| 18 | Sesi login bertahan setelah refresh browser (*persistence*) | `PRD.md` §4; `DEVELOPMENT_PLAN.md` §5.1 | **LULUS** | Zustand middleware `persist` ke `localStorage` (`warga-halim-auth`), diverifikasi oleh `GET /api/auth/me` pada saat inisialisasi aplikasi. |
| 19 | Reset posisi scroll window ke atas saat berpindah rute | `DEVELOPMENT_PLAN.md` §8.1 (#23) | **LULUS** | Komponen `ScrollToTop.tsx` memanggil `window.scrollTo(0, 0)` pada setiap perubahan `location.pathname`. |
| 20 | Keamanan kredensial & zero-secrets di Git | `PRD.md` §7; `DEVELOPMENT_PLAN.md` §7 | **LULUS** | File `.env` masuk `.gitignore`; seluruh secret backend hanya di-*inject* via Vercel / environment variables server. |

---

## 3. Analisis Mendalam Kualitas Kode (Deep-Dive Code Review)

### 3.1 Arsitektur Frontend (`client/`)
- **Pemisahan Modul & Tanggung Jawab (Separation of Concerns):**
  - Pola arsitektur *feature-based* (`features/auth`, `features/beranda`, `features/galeri`, `features/warga`) sangat memudahkan pemeliharaan kode jangka panjang.
  - Komponen UI atomik (`Button`, `Input`, `PasswordInput`, `Card`, `Spinner`, `EmptyState`, `ConfirmDeleteActions`) terisolasi dari *business logic* dan mengimplementasikan styling berbasis Tailwind CSS v4 tokens.
- **State Management & Sesi:**
  - Zustand (`authStore.ts`) dikonfigurasi secara bersih menggunakan middleware `persist`.
  - Inisialisasi sesi pada `AppRoutes.tsx` memvalidasi integritas token ke backend via `getCurrentUser()` dan menangani pembatalan request (*cleanup flag* `cancelled`) jika terjadi unmount cepat.
- **Kinerja & Code-Splitting:**
  - Penerapan `React.lazy()` di `AppRoutes.tsx` memecah bundel aplikasi ke dalam 30+ chunks terisolasi, menjaga ukuran file indeks utama tetap ringkas (`308 kB` raw / `97 kB` gzip).

### 3.2 Arsitektur Backend (`server/`)
- **Struktur Layered Architecture:**
  - Alur satu arah yang disiplin: `Router -> Middleware (Auth/Role/Upload/RateLimit) -> Controller -> Service -> Database Pool (mysql2/promise)`.
  - Controller hanya bertugas mem-parsing parameter request, memanggil schema validator Zod, mendelegasikan ke service, dan mengembalikan format JSON yang konsisten.
- **Integritas Transaksi & Manajemen Media Cloudinary:**
  - Operasi multiformat pada `albumService.ts` dan `wargaService.ts` memanfaatkan helper `withTransaction()` untuk menjamin sifat *atomicity* kueri SQL.
  - Jika terjadi kegagalan commit database setelah upload Cloudinary selesai, sistem secara otomatis mengeksekusi kompensasi rollback (*cleanup*) dengan menghapus public ID foto yang terlanjur terunggah (`deletePhotosByPublicIds()`), mencegah akumulasi file yatim (*orphan assets*) di storage Cloudinary.
- **Keamanan & Otorisasi:**
  - Middleware `auth.ts` memverifikasi JWT dan melakukan kueri verifikasi `getUserById(payload.id)` ke MySQL, menjamin pengguna yang akunnya telah dihapus admin langsung kehilangan akses (401) tanpa menunggu masa berlaku token JWT habis.
  - Endpoint penghapusan akun (`userAdminService.ts`) memiliki penjagaan ganda terhadap akun administrator.

---

## 4. Log Isu & Temuan Hasil Review (Issues & Findings Log)

### 4.1 Isu yang Telah Diselesaikan (Previous Resolved Issues)

#### [RESOLVED] ISSUE-01 (Low): Standardisasi Bahasa Antarmuka
Pesan sistem, spinner, dan teks validasi form telah distandardisasi 100% ke dalam bahasa Indonesia baku.

#### [RESOLVED] ISSUE-02 (Medium): Sinkronisasi Spesifikasi PRD dan Dokumen Arsitektur
Dokumentasi telah diperbarui untuk mencerminkan palet brand `#005A9C`, teks bahasa Indonesia, dan rute navigasi.

#### [RESOLVED] ISSUE-03 (High): Keamanan Autentikasi & Database Sesi
Middleware `auth` telah mengintegrasikan pengecekan user di MySQL pada setiap request untuk mengantisipasi akun yang dihapus admin.

#### [RESOLVED] ISSUE-04 (High): Integritas Transaksi & Rollback Cloudinary
Layanan warga dan album telah dilengkapi blok `try...catch` yang menghapus file Cloudinary jika transaksi database gagal di-*commit*.

#### [RESOLVED] ISSUE-05 (Medium): Keamanan Kueri SQL Terhadap SQL Injection
Seluruh interaksi database dipastikan menggunakan *parameterized queries* `?` dari `mysql2/promise`.

#### [RESOLVED] ISSUE-06 (Low): Proteksi Stored XSS pada Rendering Teks
Rendering teks nama dan pesan & kesan menggunakan interpolasi JSX standar tanpa `dangerouslySetInnerHTML`.

#### [RESOLVED] ISSUE-07 (High): Migrasi Kolom `city` Menjadi `position`
Kolom jabatan (`position VARCHAR(100) NOT NULL`) telah bermigrasi di MySQL Railway, API server, dan form frontend tanpa anomali.

#### [RESOLVED] ISSUE-08 (High): Fitur Ubah Album & Batas 50 Foto
Kapasitas album ditingkatkan menjadi 1–50 foto dengan endpoint `PUT /api/admin/albums/:id` dan `POST /api/admin/albums/:id/photos`.

#### [RESOLVED] ISSUE-09 (Medium): Manajemen Siklus Hidup Memori Objek URL pada Formulir Album
Komponen `AlbumEditSection.tsx` telah mengimplementasikan ref-based garbage collection via `useEffect` + `useRef` untuk `URL.revokeObjectURL`.

#### [RESOLVED] ISSUE-10 (UI/UX & Modularity): Pemisahan Fitur Tombol Tambah Foto dari Formulir Ubah Album pada Panel Admin
- **Komponen:** `AlbumAddPhotosSection.tsx`, `AlbumEditSection.tsx`, `AdminAlbumPage.tsx`.
- **Deskripsi:** Tombol aksi `+ Tambah Foto` dan `Ubah Album` telah dipisahkan menjadi dua bagian independen. Membuka salah satu form otomatis menutup form lainnya untuk menjaga antarmuka tetap bersih.
- **Status:** **TERSELESAIKAN (RESOLVED)**.

---

### 4.2 Isu Tambahan yang Telah Diimplementasikan (Implemented Optimization Issues)

Berikut adalah status implementasi dari temuan kualitas kode tambahan yang telah diselesaikan secara tuntas:

#### [RESOLVED] ISSUE-11 (Low / Minor Code Optimization): Siklus Hidup Pembersihan Memori Blob URL pada Pembatalan Komponen `AlbumCreateForm.tsx` dan `WargaForm.tsx`
- **Tingkat Keparahan:** Low (Minor Memory Optimization)
- **Komponen / File Terkait:**
  - `client/src/features/galeri/AlbumCreateForm.tsx`
  - `client/src/features/warga/WargaForm.tsx`
- **Deskripsi Temuan:**
  Sebelumnya, pembersihan memori via `URL.revokeObjectURL()` pada form penambahan album baru dan biodata warga hanya dipicu saat submit berhasil atau penghapusan satu per satu. Jika admin memilih berkas lalu berpindah halaman atau menekan tombol Batal, referensi blob URL berpotensi tertahan di memori browser.
- **Tindakan Perbaikan yang Telah Diimplementasikan:**
  1. Pada `AlbumCreateForm.tsx`, menambahkan siklus pembersihan memori otomatis via `useEffect` + `useRef(photos)` saat komponen di-*unmount*.
  2. Pada `WargaForm.tsx`, menambahkan ref-based unmount cleanup via `useEffect` + `useRef(photos)`, pembersihan eksplisit pada `handleCancel`, serta pembersihan setelah `onSubmitData` selesai dieksekusi.
- **Status:** **TERSELESAIKAN (RESOLVED)**.

---

#### [RESOLVED] ISSUE-12 (Low / Minor UX Quality): Proteksi Nilai Input Form pada `AdminVideoPage.tsx` saat Background Query Refetch
- **Tingkat Keparahan:** Low (Edge-case UX Polish)
- **Komponen / File Terkait:**
  - `client/src/pages/AdminVideoPage.tsx`
- **Deskripsi Temuan:**
  Komponen `AdminVideoPage.tsx` menggunakan `useForm` dengan properti `values` yang terikat pada data server `video`. Jika terjadi background refetch saat window kembali difokuskan ketika admin sedang mengetik, nilai formulir dapat ter-reset.
- **Tindakan Perbaikan yang Telah Diimplementasikan:**
  Menambahkan konfigurasi `resetOptions: { keepDirtyValues: true }` pada inisialisasi `useForm` di `AdminVideoPage.tsx` sehingga nilai kotor (*dirty values*) yang sedang diinput oleh admin tetap dipertahankan dan tidak ditimpa oleh siklus pembaruan latar belakang.
- **Status:** **TERSELESAIKAN (RESOLVED)**.

---

#### [RESOLVED] ISSUE-13 (Low / Defensive Programming): Sinkronisasi Validasi Ekstensi Berkas Gambar pada Frontend `fileUtils.ts`
- **Tingkat Keparahan:** Low (Defensive Consistency)
- **Komponen / File Terkait:**
  - `client/src/features/warga/fileUtils.ts`
  - `server/src/middlewares/upload.ts`
- **Deskripsi Temuan:**
  Validasi berkas foto di backend menggunakan verifikasi ganda (MIME type dan ekstensi file `.jpg`, `.jpeg`, `.png`, `.webp`), sedangkan di frontend sebelumnya hanya memeriksa `file.type`.
- **Tindakan Perbaikan yang Telah Diimplementasikan:**
  Memperbarui fungsi `validateImageFile` pada `fileUtils.ts` dengan menambahkan evaluasi ekstensi berkas (`ALLOWED_EXTENSIONS`) secara konsisten bersama `ALLOWED_MIME_TYPES`.
- **Status:** **TERSELESAIKAN (RESOLVED)**.

---

## 5. Audit Keamanan & Kredensial (Security Audit)

1. **Pemeriksaan Repositori & Kredensial:**
   - Seluruh file `.env`, API key, secret token JWT, dan kata sandi database MySQL Railway terisolasi 100% dan diabaikan oleh `.gitignore`.
   - File `.env.example` di client dan server hanya menyediakan konfigurasi template tanpa nilai rahasia.
2. **Kriptografi & Autentikasi:**
   - Kata sandi disimpan dengan hash `bcrypt` (cost factor 10).
   - Token JWT ditandatangani menggunakan `HS256` dengan kedaluwarsa 1 hari (`1d`).
   - Setiap pemanggilan endpoint terlindungi memeriksa status keberadaan akun di MySQL (`getUserById`).
3. **Kontrol Akses Berbasis Peran (RBAC):**
   - Rute admin `/api/admin/*` dilindungi middleware berlapis (`auth` + `requireAdmin`). Akses non-admin menghasilkan HTTP 403 Forbidden.
   - Endpoint penghapusan akun (`DELETE /api/admin/users/:id`) secara ketat menolak penghapusan akun berstatus `admin`.
4. **Proteksi Injeksi SQL & Stored XSS:**
   - Seluruh kueri database menggunakan parameter binding `?` tanpa *string concatenation*.
   - Output teks pengguna dirender murni melalui interpolasi JSX React yang melakukan *HTML entity encoding* secara otomatis.
5. **Sanitasi File Upload:**
   - Multer membatasi ukuran berkas maksimal 2 MB per foto dan menyimpannya di memori RAM server.
   - MIME type dan ekstensi berkas difilter ketat (`image/jpeg`, `image/png`, `image/webp`).
   - Penamaan berkas Cloudinary menggunakan UUID acak (`crypto.randomUUID()`).

---

## 6. Ringkasan Pengujian Lingkungan (Testing & Deployment Status)

- **Typecheck Backend:** `npm --prefix server run typecheck` lolos dengan **0 error**.
- **Build Produksi Frontend:** `npm --prefix client run build` lolos dalam **1.15 detik** dengan 0 warning/error.
- **Live Frontend Production:** [https://wargahalim.vercel.app/](https://wargahalim.vercel.app/) merespons **HTTP 200 OK** (`<html lang="id">`, brand color `#005A9C`).
- **Live Backend API Production:** [https://warga-halim-api.vercel.app/api/home](https://warga-halim-api.vercel.app/api/home) merespons **HTTP 200 OK** dengan payload JSON valid.
- **Server Dev Lokal:** Backend siap di port `5000` dan frontend siap di port `5173`.

---

## 7. Kesimpulan & Rekomendasi Tech Lead

Basis kode **Warga Halim** berada dalam kondisi luar biasa solid, arsitektur modular yang matang, serta patuh sepenuhnya terhadap seluruh kriteria penyelesaian PRD dan dokumen pendukung. Seluruh 13 isu pada `issue.md` telah tuntas terselesaikan (100% RESOLVED), termasuk optimasi siklus hidup pembersihan memori objek blob, proteksi nilai input form video dari background refetch, serta sinkronisasi ganda filter ekstensi file gambar. Sistem secara operasional telah **siap pakai untuk produksi (Production Ready)** dan siap digunakan untuk pengisian data warga riil oleh tim administrator.
