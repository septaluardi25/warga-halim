# Laporan Review Kode & Daftar Isu (issue.md)
**Proyek:** Warga Halim  
**Peran:** Senior Software Engineer / Tech Lead  
**Tanggal:** 15 November 2026  
**Referensi Utama:**
- `docs/PRD.md`
- `docs/DEVELOPMENT_PLAN.md`
- `docs/DATABASE_DESIGN.md`
- `docs/API_DOCUMENTATION.md`

---

## 1. Ringkasan Eksekutif (Executive Summary)

Berdasarkan audit mendalam terhadap seluruh basis kode (`client/` dan `server/`) serta cross-check menyeluruh terhadap spesifikasi produk pada dokumen PRD, Development Plan, Desain Database, dan Dokumentasi API, seluruh temuan isu dan rekomendasi optimasi telah **diimplementasikan dan diselesaikan secara menyeluruh (100% RESOLVED)**.

### Status Keseluruhan
- **Arsitektur:** Pemisahan *separation of concerns* yang jelas (frontend React SPA + backend Express REST API dengan alur satu arah: `routes -> controllers -> services -> database`).
- **Keamanan:** Bebas dari kebocoran kredensial di git; autentikasi berbasis JWT statis 1 hari + *database existence check* di setiap permintaan; validasi Zod ketat di hulu (frontend) dan hilir (backend); kueri MySQL menggunakan *parameterized queries* `?` (kebal SQL Injection); dilengkapi HTTP Security Headers dan in-memory Rate Limiting pada login.
- **Integritas Data:** Migrasi kolom `position` (jabatan) menggantikan `city` telah diterapkan secara aman di MySQL Railway tanpa data loss.
- **Kinerja Frontend:** Penerapan *code-splitting* via `React.lazy()` memangkas ukuran bundle awal hingga 41%, serta pengunggahan file gambar telah beralih ke penyimpanan objek `File` langsung dan `URL.createObjectURL()` untuk efisiensi memori heap browser.
- **Kesesuaian Desain:** Tema warna brand **#005A9C** dan **white** (`#ffffff`) telah diaplikasikan konsisten, antarmuka berbahasa Indonesia, tombol Hamburger mobile aktif, dan scroll otomatis kembali ke atas saat navigasi antar halaman.

---

## 2. Matriks Kriteria Selesai PRD (Compliance Matrix)

| # | Kriteria PRD | Status | Catatan Verifikasi |
|---|---|:---:|---|
| 1 | Pengunjung belum login diblokir dari `/members` & `/members/:id`; user login diblokir dari `/login` & `/register` (`GuestRoute`) | **LULUS** | Diuji via `ProtectedRoute` dan `GuestRoute`. Redirect bekerja akurat ke `/login` atau `/members`/`/admin`. |
| 2 | Registrasi user baru (nama min 6, password min 8, re-enter password cocok), login, pencarian nama, dan detail warga | **LULUS** | Validasi Zod form + backend aktif; debounce pencarian nama; detail foto besar dapat diklik. |
| 3 | Login admin (`admin@warga.co`), tambah, ubah, hapus biodata warga + upload 3–10 foto | **LULUS** | Transaksi atomik database, validasi 3–10 foto, upload memori Multer + Cloudinary dengan rollback otomatis jika gagal. |
| 4 | User biasa diblokir dari `/admin` dan `/api/admin/*` (HTTP 403) | **LULUS** | Diuji via `AdminRoute` di frontend dan middleware `requireAdmin` di backend. |
| 5 | Target data: ~25 biodata terisi foto | **DALAM PROSES** | Infrastruktur dan CRUD siap; data riil diisi bertahap oleh admin/pengurus di lingkungan produksi. |
| 6 | Tidak ada credential di repo; `.env.example` tersedia; `.env` diabaikan git | **LULUS** | Diaudit via `git status`, `git check-ignore`, dan riwayat commit. |
| 7 | Tampilan responsif di HP (tombol Hamburger) dan desktop; antarmuka bahasa Indonesia; warna brand #005A9C & white | **LULUS** | Tailwind v4 tokens `--color-sky-primary: #005A9C`, `--color-sky-dark: #004578`, `Button.tsx` primary `#005A9C` & putih. |
| 8 | Target awal: minimal 10 mantan karyawan mendaftar | **DALAM PROSES** | Fitur registrasi live dan siap digunakan oleh pengguna di produksi. |
| 9 | Halaman galeri (`/gallery`, alias `/galeri`) publik tanpa login | **LULUS** | Rute publik tanpa token auth; menampilkan seluruh album kenangan. |
| 10 | Kartu warga hanya 1 foto; detail foto utama besar klik untuk berganti tanpa thumbnail baris bawah; pesan & kesan rapi; tolak < 3 atau > 10 foto | **LULUS** | `WargaCard.tsx` (sort_order = 1), `WargaPhotoGallery.tsx` (clickable carousel single-view), Zod schema (min 3, max 10). |
| 11 | Beranda: Hero berlatar `home.jpg`, profil perusahaan statis, slideshow album (Embla), dan satu video YouTube | **LULUS** | Full-width Hero, 3 paragraf profil perusahaan, Embla autoplay 5 detik, lazy embed iframe YouTube nocookie. |
| 12 | Pesan & kesan hanya diisi admin; user hanya membaca | **LULUS** | Field hanya ada di `WargaForm.tsx` admin; di detail warga berupa kartu kutipan baca-saja; tidak ada endpoint ubah bagi user. |
| 13 | Album bersifat umum (tanpa `warga_id`), tidak tampil di detail warga | **LULUS** | Tabel `albums` & `album_photos` independen; detail warga hanya mengambil data dari `warga_photos`. |
| 14 | Beranda hanya 1 video; video baru menimpa video lama | **LULUS** | Transaksi SQL `DELETE FROM videos` lalu `INSERT` dalam satu siklus (`videoService.ts`). |
| 15 | Admin kelola akun user (`/admin/users`), hapus akun user; akun terhapus otomatis ditolak login & sesinya gugur | **LULUS** | Middleware `auth.ts` memverifikasi `getUserById(payload.id)` ke MySQL pada setiap request berotentikasi. |
| 16 | Validasi nama min 6, password min 8, re-enter password cocok; fitur tampilkan/sembunyikan password | **LULUS** | `PasswordInput.tsx` toggle state; skema Zod `.refine()` untuk kesesuaian konfirmasi password. |
| 17 | Sesi login bertahan setelah refresh browser | **LULUS** | Zustand `persist` ke `localStorage` (`warga-halim-auth`) diverifikasi ulang oleh pemanggilan `GET /api/auth/me`. |
| 18 | Penolakan biodata jika jabatan (`position`) kosong | **LULUS** | `position VARCHAR(100) NOT NULL`, validasi Zod frontend & backend menolak string kosong/spasi. |

---

## 3. Daftar Temuan Isu & Status Implementasi (Issues Log)

### [RESOLVED] ISSUE-01 (Low - Bahasa): Teks Pesan Error dan Spinner Rute Masih Berbahasa Inggris
- **Komponen / File Terkait:**
  - `client/src/services/api.ts:60-80`
  - `client/src/routes/GuestRoute.tsx:11`
  - `client/src/routes/ProtectedRoute.tsx:11`
  - `client/src/routes/AdminRoute.tsx:11`
  - `server/src/schemas/wargaSchema.ts:50-65`
  - `server/src/services/wargaPhotoHelper.ts:80-110`
  - `server/src/services/uploadService.ts:16-32`
- **Deskripsi Masalah:**
  Ditemukan beberapa pesan sistem dan indikator pemuatan internal yang masih menggunakan teks bahasa Inggris, antara lain `Session expired, please sign in again.`, `Checking session...`, dan error multer/helper.
- **Tindakan Perbaikan:** Seluruh string teks telah diperbarui ke bahasa Indonesia yang baku dan ramah pengguna.
- **Status:** **TERSELESAIKAN (RESOLVED)**.

---

### [RESOLVED] ISSUE-02 (Medium - Dokumentasi): Inkonsistensi Keterangan Bahasa dan Warna pada `PRD.md` dan `DEVELOPMENT_PLAN.md`
- **Komponen / File Terkait:**
  - `docs/PRD.md` (baris 12, 100, 124-125)
  - `docs/DEVELOPMENT_PLAN.md` (baris 53, 209, 239, 245, 267, 271)
- **Deskripsi Masalah:**
  Pada beberapa paragraf awal di `PRD.md` dan `DEVELOPMENT_PLAN.md`, masih tertulis deskripsi lama: *"bahasa antarmuka berbahasa Inggris"* dan *"tombol menggunakan merah scarlet"*.
- **Tindakan Perbaikan:** Kalimat-kalimat pada dokumen spesifikasi telah diselaraskan penuh dengan instruksi terkini: antarmuka bahasa Indonesia dan warna brand `#005A9C` & putih.
- **Status:** **TERSELESAIKAN (RESOLVED)**.

---

### [RESOLVED] ISSUE-03 (High - Skema Database): Kolom `city` Berubah Menjadi `position`
- **Komponen / File Terkait:**
  - Railway MySQL Database (`monorail.proxy.rlwy.net:20460`, DB: `railway`)
  - `server/sql/schema.sql:13`
  - `server/src/types/models.ts` & `client/src/types/index.ts`
  - `server/src/services/wargaService.ts` & `wargaPhotoHelper.ts`
  - `client/src/features/warga/wargaSchema.ts` & `WargaForm.tsx`
- **Deskripsi Masalah:**
  Kolom domisili (`city`) diganti menjadi jabatan terakhir mantan karyawan (`position`).
- **Tindakan Perbaikan:**
  - Eksekusi migrasi database: `ALTER TABLE warga CHANGE COLUMN city position VARCHAR(100) NOT NULL;` pada MySQL produksi dan lokal.
  - Penyesuaian seluruh kueri SQL, interface TypeScript, schema validasi Zod, dan form input UI.
- **Status:** **TERSELESAIKAN (RESOLVED)**.

---

### [RESOLVED] ISSUE-04 (Medium - Kinerja Memori Frontend): Penggunaan Base64 Data URL untuk Preview Upload Gambar
- **Komponen / File Terkait:**
  - `client/src/features/warga/WargaPhotoManager.tsx`
  - `client/src/features/warga/WargaForm.tsx`
  - `client/src/features/galeri/AlbumCreateForm.tsx`
  - `client/src/services/api.ts:95-110`
  - `client/src/services/wargaService.ts`
  - `client/src/services/homeService.ts`
- **Deskripsi Masalah:**
  Sebelumnya foto yang dipilih pengguna dibaca melalui `FileReader.readAsDataURL` menjadi string base64, lalu didecode kembali dengan `atob()` saat submit. Hal ini memakan memori heap browser dan memperlambat UI.
- **Tindakan Perbaikan yang Telah Diimplementasikan:**
  - Menyimpan referensi objek `File` langsung di dalam state komponen.
  - Menggunakan `URL.createObjectURL(file)` untuk instant preview tanpa latensi pembacaan file.
  - Menambahkan siklus pembersihan memori otomatis `URL.revokeObjectURL()` saat foto dihapus atau selesai disimpan.
  - Memperbarui `appendPhotoFiles()` pada `api.ts` agar langsung menyertakan objek `File` ke dalam `FormData`, sambil tetap mempertahankan backward compatibility dengan string URL jika diperlukan.
- **Status:** **TERSELESAIKAN (RESOLVED)**.

---

### [RESOLVED] ISSUE-05 (Medium - Hardening Keamanan Server): Penambahan HTTP Security Headers & Login Rate Limiting
- **Komponen / File Terkait:**
  - `server/src/app.ts`
  - `server/src/middlewares/rateLimiter.ts`
  - `server/src/routes/auth.routes.ts`
- **Deskripsi Masalah:**
  Server Express memerlukan lapisan proteksi tambahan terhadap serangan brute-force pada formulir login dan header keamanan standar HTTP.
- **Tindakan Perbaikan yang Telah Diimplementasikan:**
  - Menonaktifkan header `x-powered-by` via `app.disable('x-powered-by')`.
  - Mengonfigurasi security headers standar:
    - `X-Content-Type-Options: nosniff` (mitigasi MIME sniffing)
    - `X-Frame-Options: SAMEORIGIN` (mitigasi clickjacking)
    - `X-XSS-Protection: 0` (standar modern OWASP)
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - Mengimplementasikan middleware `loginRateLimiter` berbasis sliding-window in-memory (maksimal 10 percobaan per 5 menit per IP) dengan pembersihan memori otomatis berkala (`setInterval().unref()`) tanpa dependensi eksternal tambahan.
- **Status:** **TERSELESAIKAN (RESOLVED)**.

---

### [RESOLVED] ISSUE-06 (Medium - Optimasi Bundle Frontend): Code-Splitting Bundle Vite dengan `React.lazy()`
- **Komponen / File Terkait:**
  - `client/src/routes/AppRoutes.tsx`
  - `client/src/components/layout/PageLayout.tsx`
- **Deskripsi Masalah:**
  Build Vite menghasilkan peringatan bundle monolitik berukuran ~528 kB (> 500 kB) karena semua halaman diimpor secara statis (*eager import*).
- **Tindakan Perbaikan yang Telah Diimplementasikan:**
  - Mengonversi seluruh impor halaman (`HomePage`, `GalleryPage`, `LoginPage`, `RegisterPage`, `WargaListPage`, `WargaDetailPage`, dan seluruh halaman `Admin*`) menjadi `React.lazy(() => import(...))`.
  - Membungkus `<Outlet />` pada `PageLayout.tsx` dengan `<Suspense fallback={<Spinner fullPage label="Memuat halaman..." />}>`.
  - Hasil optimasi build: bundle JavaScript utama menyusut dari 528 kB menjadi 308 kB (~97 kB gzipped), dan peringatan ukuran chunk Vite hilang sepenuhnya.
- **Status:** **TERSELESAIKAN (RESOLVED)**.

---

## 4. Audit Keamanan & Kredensial (Security Audit)

1. **Pemeriksaan Repositori & Riwayat Commit:**
   - Tidak ada file `.env`, API key, secret token JWT, atau password database yang terunggah ke repositori Git.
   - File `.gitignore` mengabaikan seluruh varian `.env` di root, `client/`, dan `server/`.
   - File `.env.example` hanya memuat placeholder tanpa nilai rahasia.

2. **Autentikasi & Penyimpanan Password:**
   - Password disimpan menggunakan algoritma `bcrypt` dengan cost factor 10.
   - Token JWT ditandatangani menggunakan `HS256` dengan masa berlaku 1 hari (`1d`).
   - Setiap pemanggilan endpoint terlindungi memeriksa eksistensi akun pengguna di MySQL (`getUserById(payload.id)`). Jika akun dihapus oleh admin, token lama otomatis gugur dengan status HTTP 401.

3. **Otorisasi & Kontrol Akses Berbasis Peran (RBAC):**
   - Rute admin (`/api/admin/*`) dilindungi ganda oleh middleware `auth` dan `requireAdmin`. Pengguna biasa mendapatkan status 403.
   - Endpoint penghapusan akun (`DELETE /api/admin/users/:id`) secara eksplisit memeriksa `role !== 'admin'`. Akun administrator tidak dapat dihapus melalui API.

4. **Pencegahan Injeksi:**
   - Seluruh operasi database menggunakan parameterized query `?` dari library `mysql2/promise`. Tidak ditemukan penggabungan string (*string concatenation*) pada query SQL.
   - Teks pesan & kesan serta nama warga dirender melalui interpolasi JSX standar React yang secara otomatis melakukan sanitasi karakter berbahaya (mencegah Stored XSS). Tidak ada penggunaan `dangerouslySetInnerHTML`.

5. **Sanitasi File Upload:**
   - Multer membatasi ukuran file maksimum 2 MB per foto dan menyimpannya di memori (`memoryStorage`).
   - MIME type dan ekstensi file dibatasi ketat hanya untuk `.jpg`, `.jpeg`, `.png`, dan `.webp`.
   - Nama file di Cloudinary diganti secara acak menggunakan `crypto.randomUUID()`.

---

## 5. Ringkasan Pengujian Lingkungan (Testing & Deployment)

- **Typecheck Server:** `npm --prefix server run typecheck` lolos dengan 0 error.
- **Build Client:** `npm --prefix client run build` lolos tanpa warning dan menghasilkan chunk terisolasi di `client/dist`.
- **Live Production Frontend:** [https://wargahalim.vercel.app/](https://wargahalim.vercel.app/) merespons status HTTP 200 OK dengan HTML `<html lang="id">` dan warna brand `#005A9C`.
- **Live Production Backend API:** [https://warga-halim-api.vercel.app/api/home](https://warga-halim-api.vercel.app/api/home) merespons status HTTP 200 OK dengan payload JSON valid.
- **Server Dev Lokal:** Backend aktif di `http://localhost:5000` dan frontend aktif di `http://localhost:5173`.

---

## 6. Kesimpulan & Langkah Lanjutan

Seluruh 6 isu pada `issue.md` telah diselesaikan (100% RESOLVED). Kode telah siap untuk fase pemeliharaan operasional dan pengisian data warga riil (~25 orang mantan karyawan) oleh tim administrator.
