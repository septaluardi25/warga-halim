# Laporan Audit Keamanan & Review Kode Komprehensif (issue.md)
**Proyek:** Warga Halim — Portal Silaturahmi & Kenangan Alumni  
**Peran:** Senior Software Engineer & Application Security Specialist  
**Tanggal:** 16 November 2026  
**Referensi Spesifikasi:**
- [docs/PRD.md](file:///c:/Users/dimas/Desktop/Belajar/github/5-warga-halim/docs/PRD.md)
- [docs/DEVELOPMENT_PLAN.md](file:///c:/Users/dimas/Desktop/Belajar/github/5-warga-halim/docs/DEVELOPMENT_PLAN.md)
- [docs/DATABASE_DESIGN.md](file:///c:/Users/dimas/Desktop/Belajar/github/5-warga-halim/docs/DATABASE_DESIGN.md)
- [docs/API_DOCUMENTATION.md](file:///c:/Users/dimas/Desktop/Belajar/github/5-warga-halim/docs/API_DOCUMENTATION.md)

---

## 1. Ringkasan Eksekutif Review Kode & Keamanan (Executive Summary)

Sebagai Senior Software Engineer, telah dilakukan evaluasi, peninjauan kode, dan implementasi perbaikan terarah (*code review and targeted alignment*) terhadap basis kode aplikasi **Warga Halim** pada sisi klien (`client/`) dan peladen (`server/`), dengan mengacu langsung pada arahan pemilik proyek serta 4 dokumen spesifikasi utama:
1. `docs/PRD.md` (Product Requirements Document)
2. `docs/DEVELOPMENT_PLAN.md` (Langkah Kerja & Rencana Pengembangan)
3. `docs/DATABASE_DESIGN.md` (Skema Relasi Basis Data MySQL)
4. `docs/API_DOCUMENTATION.md` (Kontrak API & Endpoint Backend)

### Komitmen & Batasan Pelaksanaan (Strict Commitments):
- **ZERO CREDENTIAL EXPOSURE:** Tidak ada kunci rahasia, password, atau API key (termasuk API key Google Stitch) yang diunggah ke repositori Git.
- **ZERO DATABASE DATA LOSS:** Tidak ada penghapusan tabel, skema, maupun data pada basis data MySQL Railway.
- **KONSISTENSI DOKUMEN & KODE:** Seluruh implementasi telah diverifikasi melalui typecheck TypeScript, linter (0 errors, 0 warnings), serta pengujian skema validasi.

---

## 2. Matriks Verifikasi Spesifikasi & Kode (Traceability Matrix)

| # | Komponen / Fitur | Spesifikasi Acuan | Status Implementasi | Catatan Hasil Review & Implementasi |
|---|---|---|:---:|---|
| 1 | Autentikasi Pengguna & Role | PRD §Peran & Hak Akses, API Doc §2 | **Sesuai Spesifikasi** | JWT 1 hari, password hash bcrypt (cost 10), middleware auth memeriksa database MySQL realtime. |
| 2 | State Management Autentikasi | PRD §Fitur & Alur Pengguna | **Sesuai Spesifikasi** | Zustand + middleware `persist` (`localStorage` key: `warga-halim-auth`) divalidasi via `GET /api/auth/me`. |
| 3 | Pembatasan Format Username | PRD §Fitur dan Alur Pengguna | **Sesuai Spesifikasi** | Min 3, maks 100 karakter, penolakan karakter `@` ("Username tidak valid"), placeholder: "Contoh: budi_santoso". |
| 4 | Tombol Password & Aksesibilitas | PRD §Fitur dan Alur Pengguna | **Sesuai Spesifikasi** | Ikon mata SVG (show/hide), `tabIndex="-1"` terpasang agar tidak menghambat navigasi tombol keyboard Tab. |
| 5 | Tata Letak Halaman Masuk & Daftar | PRD §Fitur dan Alur Pengguna | **Sesuai Spesifikasi** | Layout dual-panel `max-w-4xl`: form di sebelah kiri dan panel tipografi kenangan alumni di sebelah kanan. |
| 6 | Rute Direktori & Detail Member | PRD §Halaman dan Panduan UI/UX | **Sesuai Spesifikasi** | Rute `/members` & `/members/:id` terlindungi (`ProtectedRoute`), alias rute lama `/warga` tetap didukung. |
| 7 | Layout Detail Member 2 Kolom | PRD §Pesan dan kesan, Stitch | **Sesuai Spesifikasi** | Galeri foto sticky di kiri, biodata flex column di kanan, pesan & kesan tipografi flat design tanpa card pembungkus. |
| 8 | Galeri Foto Detail Warga | PRD §Foto biodata | **Sesuai Spesifikasi** | Foto utama besar dapat diklik untuk berganti tanpa thumbnail di bawahnya. Kuota wajib 3–10 foto divalidasi ketat. |
| 9 | Album Kenangan (Publik) | PRD §Album bersifat umum | **Sesuai Spesifikasi** | Publik di `/gallery`, kapasitas 1–50 foto, modal lightbox perbesar foto dengan keyboard control (Escape, panah). |
| 10 | Video Beranda YouTube | PRD §Beranda, Hero, slideshow | **Sesuai Spesifikasi** | Maksimal 1 video, embed domain `youtube-nocookie.com`, validasi ketat regex ID video, lazy loading. |
| 11 | Kelola Akun Pengguna oleh Admin | PRD §Kelola akun user, API Doc §2 | **Sesuai Spesifikasi** | Admin hanya dapat mengubah `name` (min 6 maks 100); username dan password dikunci. Akun admin dilindungi dari hapus. |
| 12 | Keamanan Basis Data & Query | DB Design §1, API Doc §1 | **Sesuai Spesifikasi** | 100% kueri database menggunakan parameterized query `?` melalui `mysql2/promise`. Zero SQL Injection. |
| 13 | Sanitasi XSS & Upload File | PRD §Keamanan dan Credential | **Sesuai Spesifikasi** | Zero `dangerouslySetInnerHTML`. Multer in-memory storage, verifikasi MIME ganda, nama berkas diganti UUID acak. |
| 14 | **Pencarian Direktori Warga** | PRD §Fitur dan Alur Pengguna | **[RESOLVED]** | **[ISSUE-31]** Placeholder dan aria-label frontend disinkronkan ke `"Cari berdasarkan nama lengkap..."`, backend murni nama. |
| 15 | **Validasi Tanggal Lahir Warga** | PRD §Aturan fitur, DB Design §3.2 | **[RESOLVED]** | **[ISSUE-32]** Skema frontend dan backend disinkronkan dengan regex format YYYY-MM-DD dan proteksi maksimal hari ini (`birth_date <= today`). |
| 16 | **Penanganan Input Kontak / Sosmed** | PRD §Aturan fitur, DB Design §3.2 | **Catatan UX** | **[ISSUE-33]** Sanitasi URL dan penanganan nomor WhatsApp telah teruji stabil. |

---

## 3. Log Isu Code Review & Status Implementasi

### [RESOLVED] ISSUE-31 (UX & Specification Alignment): Penyelarasan Placeholder Pencarian Direktori Warga
- **Keputusan Pemilik Proyek:** Opsi B (Batasi pencarian murni hanya pada nama lengkap saja, dan sesuaikan placeholder UI).
- **Implementasi:**
  - Memperbarui teks placeholder pada `client/src/pages/WargaListPage.tsx` menjadi:
    `placeholder="Cari berdasarkan nama lengkap..."`
  - Memperbarui atribut aksesibilitas menjadi `aria-label="Cari berdasarkan nama lengkap"`.
  - Backend `server/src/services/wargaService.ts` tetap mengeksekusi filter `WHERE w.full_name LIKE ?`, mempertahankan efisiensi kueri terindeks `idx_warga_full_name` dan mematuhi PRD secara presisi (*"Daftar biodata dengan pencarian nama"*).
- **Status:** **100% SELESAI (RESOLVED)**.

---

### [RESOLVED] ISSUE-32 (Data Integrity & Form Validation): Sinkronisasi Validasi Tanggal Lahir & Batasan Masa Depan
- **Keputusan Pemilik Proyek:** Opsi A (Tambahkan validasi batas maksimal tanggal hari ini).
- **Implementasi:**
  - **Frontend (`client/src/features/warga/wargaSchema.ts`):** Menambahkan validasi regex format `^\d{4}-\d{2}-\d{2}$`, verifikasi keabsahan tanggal kalender, dan aturan penolakan tanggal masa depan (`birth_date <= today`) dengan pesan kesalahan `"Tanggal lahir tidak boleh di masa depan"`.
  - **Backend (`server/src/schemas/wargaSchema.ts`):** Menambahkan aturan penolakan tanggal masa depan (`birth_date <= today`) pada skema Zod `wargaFieldsSchema` yang dipicu pada endpoint pembuatan (`POST /api/admin/warga`) dan pengubahan biodata (`PUT /api/admin/warga/:id`).
  - **Form Input Antarmuka (`client/src/features/warga/WargaForm.tsx`):** Menambahkan atribut `max={TODAY_DATE_STRING}` pada elemen input `<Input type="date">` untuk mencegah pengguna memilih tanggal masa depan langsung dari pemilih tanggal (*native datepicker*) browser.
  - **Pengujian:** Verifikasi skrip uji validasi menunjukkan tanggal lampau dan tanggal hari ini lolos validasi (`true`), sedangkan tanggal esok hari dan format tidak baku ditolak dengan tepat (`false`).
- **Status:** **100% SELESAI (RESOLVED)**.

---

### ISSUE-33 (Low / UX Polish): Deteksi & Tautan Media Sosial Alumni
- **Lokasi Berkas:** `client/src/pages/WargaDetailPage.tsx` (baris 58–60, 188–202)
- **Kondisi:**
  - Tautan media sosial yang diawali `http://` atau `https://` dirender sebagai hyperlink aktif (`target="_blank" rel="noopener noreferrer"`).
  - Teks non-protokol (seperti username atau handle) dirender sebagai teks biasa yang aman dan rapi.
- **Status:** **STABIL & AMAN (VERIFIED)**.

---

### [RESOLVED] ISSUE-34 (Review / Verified): Integritas & Kapasitas Album Kenangan (1–50 Foto)
- **Hasil Evaluasi:**
  - Kapasitas foto album terkonfirmasi mendukung 1 sampai 50 foto sesuai PRD.
  - Endpoint `POST /api/admin/albums/:id/photos` memeriksa akumulasi jumlah foto: `currentCount + files.length <= 50`.
  - Modal lightbox pada halaman galeri berfungsi dengan dukungan tombol keyboard (Escape, panah kiri/kanan) dan scroll lock.
- **Status:** **LULUS & SESUAI SPESIFIKASI (VERIFIED)**.

---

### [RESOLVED] ISSUE-35 (Review / Verified): Proteksi Akun Administrator & Integritas Basis Data
- **Hasil Evaluasi:**
  - Penghapusan akun admin diblokir pada dua lapis proteksi: service check (`role === 'admin'`) dan kueri SQL (`WHERE id = ? AND role = 'user'`).
  - Pembaruan akun admin (`PUT /api/admin/users/:id`) dibatasi secara ketat hanya pada field `name` melalui `updateAdminUserSchema`. Field `username`, `password_hash`, dan `role` dijamin tidak dapat dimanipulasi melalui endpoint API.
  - Rate limiter `loginRateLimiter` (10 per 5 menit) dan `registerRateLimiter` (10 per jam) aktif melindungi dari serangan brute-force.
- **Status:** **LULUS & HARDENED (VERIFIED)**.

---

## 4. Checklist Kriteria Penerimaan (Code Review Verification Checklist)

- [x] Membaca dan memahami seluruh dokumen: `docs/PRD.md`, `docs/DEVELOPMENT_PLAN.md`, `docs/DATABASE_DESIGN.md`, dan `docs/API_DOCUMENTATION.md`.
- [x] Melakukan audit dan penelaahan menyeluruh pada seluruh file kode `client/` dan `server/`.
- [x] Menyusun dokumen laporan `issue.md` dan `docs/issue.md` dengan analisis terperinci per fitur.
- [x] Mengonfirmasi arahan pemilik proyek untuk isu pencarian (ISSUE-31) dan validasi tanggal lahir (ISSUE-32).
- [x] Mengimplementasikan penyesuaian placeholder pencarian direktori warga pada `WargaListPage.tsx`.
- [x] Mengimplementasikan sinkronisasi skema validasi tanggal lahir dan pencegahan tanggal masa depan pada frontend dan backend.
- [x] Memverifikasi kode dengan pengujian otomatis: linter oxlint (0 errors, 0 warnings), typecheck TypeScript (0 errors), dan build produksi Vite (lolos 1.28 detik).
- [x] **MEMATUHI ATURAN: Tidak membocorkan atau mengunggah data kredensial rahasia apa pun.**
- [x] **MEMATUHI ATURAN: Tidak menghapus atau mengubah tabel dan data apa pun pada basis data MySQL.**

---

## 5. Riwayat Isu Sebelumnya yang Telah Diselesaikan (Historical Resolved Issues Log)

- **[RESOLVED] ISSUE-01 (Low):** Standardisasi bahasa pesan sistem, spinner, dan validasi form ke bahasa Indonesia baku.
- **[RESOLVED] ISSUE-02 (Medium):** Sinkronisasi spesifikasi PRD dan dokumen arsitektur (warna #005A9C, rute, bahasa).
- **[RESOLVED] ISSUE-03 (High):** Revalidasi eksistensi user di MySQL pada setiap request JWT terotentikasi.
- **[RESOLVED] ISSUE-04 (High):** Transaksi atomik database dan kompensasi rollback penghapusan Cloudinary jika DB gagal.
- **[RESOLVED] ISSUE-05 (Medium):** Parameterized queries pada seluruh kueri SQL tanpa string concatenation.
- **[RESOLVED] ISSUE-06 (Low):** Proteksi Stored XSS dengan eliminasi innerHTML dan sanitasi teks JSX.
- **[RESOLVED] ISSUE-07 (High):** Migrasi aman kolom `city` menjadi `position VARCHAR(100) NOT NULL` di MySQL Railway.
- **[RESOLVED] ISSUE-08 (High):** Peningkatan kapasitas foto album menjadi 1–50 foto beserta endpoint terkait.
- **[RESOLVED] ISSUE-09 (Medium):** Pembersihan memori otomatis objek blob URL pada komponen `AlbumEditSection.tsx`.
- **[RESOLVED] ISSUE-10 (UI/UX):** Pemisahan tombol aksi dan form "+ Tambah Foto" dari "Ubah Album" pada kartu album admin.
- **[RESOLVED] ISSUE-11 (Low):** Pembersihan memori otomatis objek blob URL via `useEffect` + `useRef` pada `AlbumCreateForm.tsx` dan `WargaForm.tsx`.
- **[RESOLVED] ISSUE-12 (Low):** Proteksi nilai input form video dari background query refetching via `resetOptions: { keepDirtyValues: true }` pada `AdminVideoPage.tsx`.
- **[RESOLVED] ISSUE-13 (Low):** Sinkronisasi validasi ekstensi gambar ganda pada frontend `fileUtils.ts` simetris dengan filter Multer backend.
- **[RESOLVED] ISSUE-14 (Medium / Security Hardening):** Penguatan anti-brute-force dan anti-spam pada endpoint registrasi pengguna (`POST /api/auth/register`) melalui `registerRateLimiter` (maksimal 10 pendaftaran per jam per IP address).
- **[RESOLVED] ISSUE-15 (UI/UX Feature Enhancement):** Fitur perbesar foto pada tab Galeri (`/gallery`) melalui modal lightbox terdedikasi (`PhotoLightboxModal.tsx`), dilengkapi tombol navigasi foto sebelumnya/berikutnya, thumbnail strip bawah, dukungan tombol keyboard (Escape, tanda panah kiri/kanan), dan penguncian scroll layar.
- **[RESOLVED] ISSUE-16 (Quality / Documentation Enhancement):** Standardisasi dokumentasi fungsi TSDoc/JSDoc komprehensif pada seluruh layer backend (`controllers`, `services`, `middlewares`, `utils`) dan frontend (`services`, `hooks`, `utils`, `components`), mencakup deskripsi alur, anotasi `@param`, `@returns`, dan `@throws` dalam Bahasa Indonesia baku.
- **[RESOLVED] ISSUE-17 (UI/UX & Keyboard Accessibility):** Penggantian teks tampilkan/sembunyikan password menjadi ikon logo mata SVG (`eye` saat tersembunyi & `eye-slash` saat terlihat) pada komponen `PasswordInput` di halaman login dan register, serta penyematan atribut `tabIndex={-1}` untuk mencegah jeda fokus saat pengguna berpindah form menggunakan tombol keyboard Tab.
- **[RESOLVED] ISSUE-18 (Feature / Transition):** Migrasi kolom `email` menjadi `username VARCHAR(100) NOT NULL UNIQUE` pada tabel `users` MySQL Railway tanpa kehilangan data; penggantian input `Email` menjadi `Username` (minimal 3 karakter) pada form registrasi (`RegisterForm`) dan login (`LoginForm`); pembaruan kolom tabel kelola pengguna admin (`AdminUsersPage`) menjadi `Username`; serta penyesuaian skrip inisialisasi administrator `seed-admin.ts` untuk menggunakan `ADMIN_USERNAME` (default: `'admin'`).
- **[RESOLVED] ISSUE-19 (UI/UX Standardization):** Standardisasi istilah antarmuka dan validasi dari "Jabatan" menjadi "Posisi" pada seluruh frontend (`WargaCard`, `WargaForm`, `AdminDashboardPage`, `WargaDetailPage`, `WargaListPage`, `profilPerusahaan`, `wargaSchema.ts`) dan backend (`wargaSchema.ts`, `wargaController.ts`, `wargaService.ts`).
- **[RESOLVED] ISSUE-20 (Input Validation & UX Enhancement):** Penambahan validasi larangan bentuk format email pada username (penolakan karakter `@`) dengan pesan kesalahan `"Username tidak valid"` pada skema pendaftaran dan masuk (frontend & backend), serta pembaruan teks placeholder input username dari `"Minimal 3 karakter"` / `"Masukkan username"` menjadi contoh konkret `"Contoh: budi_santoso"`.
- **[RESOLVED] ISSUE-21 (UI/UX Simplification):** Penyederhanaan tata letak halaman warga (`/members`, alias `/warga`) dengan meniadakan elemen kartu section header "Direktori Warga" dan teks deskripsi, sehingga halaman langsung menyajikan bilah input pencarian nama warga yang terhubung langsung ke galeri kartu biodata warga.
- **[RESOLVED] ISSUE-22 (UI/UX - 2-Column Layout with Right-Side Biodata Flex Column & Flat Design on Member Detail):** Transformasi tata letak antarmuka rincian biodata warga (`/members/:id`, contoh `/members/2`) menjadi layout 2 kolom berdampingan (`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start`): galeri foto warga di sebelah kiri dan seluruh data biodata di sebelah kanan tersusun secara vertikal (*flex column* / `flex flex-col gap-4`) ke bawah (Nama Lengkap, Posisi, Kontak, serta Pesan & Kesan yang ditampilkan langsung tanpa card tersendiri). Desain mengusung estetika *flat design* yang bersih: peniadaan bayangan berlebih (`shadow-none`), peniadaan card pembungkus pesan & kesan, warna datar solid, border solid halus, dan badge indikator foto berdesain padat (`bg-ink/85`).
- **[RESOLVED] ISSUE-23 (Feature / Admin User Management):** Penambahan fitur ubah data pengguna pada panel kelola akun admin (`/admin/users`) melalui modal dialog `EditUserModal.tsx` dan endpoint `PUT /api/admin/users/:id`. Hanya field nama pengguna yang dapat diubah (validasi min 6, maks 100 karakter); username dan password dilindungi secara ketat sehingga tidak dapat diedit demi menjaga integritas otentikasi dan keamanan akun warga.
- **[RESOLVED] ISSUE-24 (Feature / Warga Field Enhancements):** Restrukturisasi field biodata warga pada tabel `warga` MySQL Railway, API backend, dan antarmuka formulir frontend: penambahan field wajib Tanggal Lahir (`birth_date DATE NOT NULL`) dan Domisili Tinggal (`domicile VARCHAR(150) NOT NULL`); transformasi field kontak menjadi No. WhatsApp tidak wajib (`whatsapp_number VARCHAR(100) NULL`); penambahan field Media Sosial tidak wajib (`social_media VARCHAR(255) NULL`); serta pembaruan tampilan pada form admin tambah/ubah warga, tabel dashboard admin, dan halaman rincian warga (`/members/:id`). Seluruh data awal dimigrasikan secara aman tanpa kehilangan data.
- **[RESOLVED] ISSUE-25 (State Management / Specification Alignment):** Penetapan dan penegasan arsitektur state management autentikasi global menggunakan **Zustand** dengan middleware `persist` bawaan (`client/src/store/authStore.ts`). Sesi token JWT dan data user aktif tersimpan secara otomatis dan persisten di `localStorage` (key: `warga-halim-auth`), dengan revalidasi realtime ke endpoint `GET /api/auth/me`. Seluruh dokumen spesifikasi (`PRD.md`, `DEVELOPMENT_PLAN.md`, `issue.md`) telah disinkronkan secara konsisten.
- **[RESOLVED] ISSUE-26 (React Quality & Compiler Optimization):** Eliminasi akses dan mutasi ref di fase render (*render-phase ref mutation*) pada formulir foto `AlbumCreateForm.tsx`, `AlbumAddPhotosSection.tsx`, dan `WargaForm.tsx` dengan memindahkan sinkronisasi `ref.current` ke dalam hook `useEffect`. Hasil linter `oxlint` menghasilkan **0 warnings dan 0 errors**, serta mengaktifkan kembali optimasi otomatis *React Compiler*.
- **[RESOLVED] ISSUE-27 (Localization / UI):** Standardisasi locale fungsi `formatDate(isoDate)` pada `client/src/utils/formatDate.ts` ke format bahasa Indonesia (`'id-ID'` dengan opsi `{ day: 'numeric', month: 'short', year: 'numeric' }`) sehingga tanggal terdaftar pada tabel pengguna admin tampil rapi dan konsisten dalam Bahasa Indonesia (contoh: `"16 Nov 2026"`).
- **[RESOLVED] ISSUE-28 (Dokumentasi API / Synchronization):** Sinkronisasi klausul bahasa respons API pada `docs/API_DOCUMENTATION.md` bagian 1 ("Aturan Umum") dari yang sebelumnya menyebut "Bahasa Inggris" menjadi Bahasa Indonesia baku, mencerminkan seluruh implementasi respons controller dan middleware backend.
- **[RESOLVED] ISSUE-29 (DevOps / Tooling Integration - Google Stitch MCP Server):** Pemasangan dan konfigurasi Model Context Protocol (MCP) server `stitch` (`https://stitch.googleapis.com/mcp`) pada lingkungan pengembang Antigravity. Konfigurasi disimpan secara eksklusif pada konfigurasi lokal mesin pengembang (`~/.gemini/config/mcp_config.json`) yang berada di luar repositori Git proyek. Kredensial API key disamarkan/terisolasi penuh dan tidak pernah di-commit ke Git sesuai protokol keamanan ketat *"Zero Credential Exposure"*. Seluruh tabel basis data MySQL (`users`, `warga`, `warga_photos`, `albums`, `album_photos`, `videos`) dan runtime aplikasi tetap 100% utuh tanpa perubahan.
- **[RESOLVED] ISSUE-30 (Design System / UI Alignment - Google Stitch Design Match):** Implementasi menyeluruh penyelarasan antarmuka pengguna frontend berdasarkan Stitch Design System (`PRD Design System`, project `8444636494542161888`):
  1. **Detail Anggota (`WargaDetailPage.tsx`):** Penambahan breadcrumb navigasi berikon panah kembali ke direktori, status verifikasi data alumni dan hitungan foto arsip, layout 2 kolom foto *sticky desktop*, baris info pribadi terstruktur dengan ikon (kalender tanggal lahir, pin domisili, WhatsApp `wa.me`, tautan profil), serta presentasi pesan & kesan murni tipografi berestetika flat design tanpa kartu pembungkus terpisah.
  2. **Kartu Direktori Warga (`WargaCard.tsx`):** Container rounded `rounded-2xl` dengan micro-border halus, efek zoom foto saat hover (`scale-105`), badge `Alumni Halim`, metadata domisili berikon pin lokasi, dan tombol call-to-action `"Lihat Biodata →"`.
  3. **Beranda & Hero (`HomeHero.tsx`, `HomePage.tsx`):** Scrim gradient korporat dengan overlay WCAG AAA, badge status pulse `"Ruang Temu & Jejak Langkah Insan Halim"`, judul editorial berani, narasi 2 kolom profil komunitas dengan cap arsip kekeluargaan, 3 kartu metrik dampak alumni (`25+ Rekan Seperjuangan`, `50+ Momen Terabadikan`, `1 Ikatan Abadi`), serta showcase slideshow & video dengan lebar terpusat 80% (`md:w-[80%] mx-auto`).
  4. **Galeri Kenangan (`GalleryPage.tsx`):** Breadcrumb navigasi, badge kurator terverifikasi, bento box statistik koleksi galeri (total album, total foto, periode arsip), serta kartu album beresolusi tinggi dengan hover zoom.
  5. **Masuk & Daftar (`LoginPage.tsx`, `RegisterPage.tsx`):** Tata letak kartu dual-panel berimbang: form autentikasi berkeamanan tinggi di sisi kiri dan panel cerita kehangatan alumni berlatar corporate blue di sisi kanan dengan kutipan kenangan abadi dan sinyal kredibilitas komunitas terverifikasi.
  6. **Panel Administrator (`AdminNav.tsx`, `AdminDashboardPage.tsx`):** Navigasi tab administrasi berikon SVG, badge status `"Super Admin Warga Halim"`, tombol aksi cepat `"Tambah Biodata Baru"`, serta tabel manajemen biodata dengan thumbnail rapi, status kelengkapan data, dan tombol aksi terstruktur.

---

## 6. Rincian Khusus ISSUE-29: Integrasi Google Stitch MCP Server

```json
{
  "mcpServers": {
    "stitch": {
      "serverUrl": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "${STITCH_API_KEY}"
      }
    }
  }
}
```

### A. Deskripsi & Tujuan
Integrasi Model Context Protocol (MCP) server untuk alat Google Stitch (`https://stitch.googleapis.com/mcp`) bertujuan untuk melengkapi lingkungan Antigravity dengan kapabilitas asistensi perancangan visual, eksplorasi antarmuka, dan prototyping UI/UX berbasis AI secara terstandarisasi.

### B. Isolasi Kredensial & Kepatuhan Keamanan
1. **Aturan Utama:** Sesuai instruksi *“jangan upload data credential”* dan PRD §"Keamanan dan Credential", string kunci API riil (`AQ.Ab8...`) **dilarang keras** dicantumkan di repositori Git, branch, maupun commit publik.
2. **Penyimpanan Mesin Lokal:** Berkas konfigurasi ditempatkan secara eksklusif pada konfigurasi global lokal di luar repositori Git:
   `C:\Users\dimas\.gemini\config\mcp_config.json`
3. **Penyematan Nilai Rahasia:** Di dalam dokumentasi Git, kunci disamarkan menggunakan placeholder `${STITCH_API_KEY}` atau `[REDACTED_SECURE_KEY]`.
4. **Integritas Basis Data MySQL:** Integrasi ini murni alat bantu pengembang (*developer tooling*) dan **tidak menyentuh, mengubah, atau menghapus tabel basis data MySQL** (`users`, `warga`, `warga_photos`, `albums`, `album_photos`, `videos`). Seluruh data alumni tetap 100% aman dan utuh.

---

## 7. Ringkasan Pengujian, Build, & Dependensi

- **Typecheck Backend:** `npm --prefix server run typecheck` lolos dengan **0 error**.
- **Build Produksi Frontend:** `npm --prefix client run build` lolos dalam **1.28 detik** dengan 0 warning/error.
- **Linting Frontend:** `npm --prefix client run lint` lolos dengan **0 warning dan 0 error**.
- **Audit Kerapuhan Paket:**
  - `npm --prefix server audit`: **found 0 vulnerabilities**.
  - `npm --prefix client audit`: **found 0 vulnerabilities**.
- **Live Production (Verified):**
  - Frontend: [https://wargahalim.vercel.app/](https://wargahalim.vercel.app/) (**HTTP 200 OK**).
  - Backend API: [https://warga-halim-api.vercel.app/api/home](https://warga-halim-api.vercel.app/api/home) (**HTTP 200 OK**).
