# API Documentation — Warga Halim

Sumber kebenaran: [`PRD.md`](./PRD.md) bagian "API". Dokumen ini merinci request dan response tiap endpoint. Data mock di `client/src/mocks/` **harus** memakai bentuk data yang sama dengan dokumen ini.

---

## 1. Aturan Umum

| Hal | Aturan |
| --- | --- |
| Base path | Semua endpoint diawali `/api` |
| Format | JSON, kecuali upload foto memakai `multipart/form-data` |
| Autentikasi | Header `Authorization: Bearer <token>` |
| Token | JWT, berlaku 1 hari (`JWT_EXPIRES_IN`). Payload: `{ id, role }` |
| CORS | Paket `cors`, hanya izinkan origin `CLIENT_URL` |
| Upload foto | **Hanya admin.** jpg/png/webp, maks 2 MB per foto, nama file acak. multer memori → Cloudinary |
| Nama field JSON | `snake_case`, sama dengan kolom database |
| Teks pesan | Bahasa Inggris |

### Level akses

| Label | Artinya | Middleware |
| --- | --- | --- |
| Publik | Tanpa token | — |
| Login | Token valid, user masih ada di DB, role `user` atau `admin` | `auth` |
| Admin | Seperti Login **dan** role `admin` | `auth` + `role("admin")` |

Middleware `auth`: verifikasi JWT → cari user dengan `id` dari token di tabel `users` → jika tidak ada (misalnya sudah dihapus admin) balas 401 → simpan user di `req.user`.

### Format error (seragam)

```json
{ "message": "Text for user in English" }
```

| Kode | Kapan |
| --- | --- |
| 400 | Validasi Zod gagal, jumlah/format/ukuran foto salah, email sudah terdaftar |
| 401 | Tidak ada token, token tidak valid/kedaluwarsa, akun sudah dihapus, email/password salah |
| 403 | Login tetapi bukan admin saat memanggil `/api/admin/*`, atau mencoba menghapus akun admin |
| 404 | Data dengan `id` tersebut tidak ada |
| 500 | Error server / database / Cloudinary (jangan bocorkan detail teknis ke pengguna) |

---

## 2. Daftar Endpoint

| # | Method | Path | Akses | Fungsi |
| --- | --- | --- | --- | --- |
| 1 | POST | `/api/auth/register` | Publik | Daftar user baru |
| 2 | POST | `/api/auth/login` | Publik | Login, kembalikan token + user |
| 3 | GET | `/api/auth/me` | Login | Data user dari token (dipakai saat refresh halaman) |
| 4 | GET | `/api/home` | Publik | Album + foto (slideshow) dan satu video |
| 5 | GET | `/api/albums` | Publik | Semua album + foto (galeri) |
| 6 | GET | `/api/warga?search=` | Login | Daftar biodata (foto kartu saja) |
| 7 | GET | `/api/warga/:id` | Login | Detail biodata + semua foto + pesan & kesan (baca saja) |
| 8 | POST | `/api/admin/warga` | Admin | Tambah biodata (termasuk pesan & kesan) + 3–10 foto |
| 9 | PUT | `/api/admin/warga/:id` | Admin | Ubah biodata (termasuk pesan & kesan dan foto) |
| 10 | DELETE | `/api/admin/warga/:id` | Admin | Hapus biodata |
| 11 | GET | `/api/admin/users` | Admin | Daftar akun role `user` |
| 12 | DELETE | `/api/admin/users/:id` | Admin | Hapus akun user |
| 13 | POST | `/api/admin/albums` | Admin | Buat album umum + upload foto |
| 14 | DELETE | `/api/admin/albums/:id` | Admin | Hapus album + fotonya |
| 15 | POST | `/api/admin/videos` | Admin | Simpan video (mengganti video lama) |
| 16 | DELETE | `/api/admin/videos/:id` | Admin | Hapus video |

> **Pesan & kesan:** hanya endpoint #8 dan #9 (Admin) yang menulis `message_impression`.
> **Upload foto:** hanya endpoint #8, #9, #13 (Admin).
> **Album:** umum. Tidak ada endpoint album per warga, dan response warga tidak berisi album.
> **Video:** hanya 1. Tidak ada endpoint daftar video; halaman `/admin/video` memakai `video` dari `GET /api/home`.

---

## 3. Tipe Data Bersama

Taruh di `client/src/types/`.

```ts
type Role = "admin" | "user";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface AdminUserRow extends User {
  created_at: string;
}

interface Photo {
  id: number;
  photo_url: string;
  sort_order: number;
}

interface WargaListItem {
  id: number;
  full_name: string;
  city: string;
  card_photo_url: string | null; // foto sort_order = 1
}

interface WargaDetail {
  id: number;
  full_name: string;
  city: string;
  contact: string | null;
  message_impression: string | null; // diisi admin, user hanya membaca
  photos: Photo[];                    // 3–10, urut sort_order
}

interface Album {             // album umum, tidak ada warga_id
  id: number;
  title: string;
  created_at: string;
  photos: Photo[];
}

interface Video {
  id: number;
  title: string;
  youtube_url: string;
  created_at: string;
}
```

> `public_id` Cloudinary dan `password_hash` **tidak pernah** dikirim ke frontend.

---

## 4. Detail Endpoint

### 4.1 Auth

#### 1. `POST /api/auth/register` — Publik

Request:
```json
{ "name": "Budi Santoso", "email": "budi@contoh.com", "password": "rahasia123" }
```

| Field | Aturan Zod | Pesan error contoh |
| --- | --- | --- |
| `name` | trim, **min 6**, maks 100 | "Name must be at least 6 characters" |
| `email` | format email, maks 150 | "Invalid email address" |
| `password` | **min 8**, maks 72 (batas bcrypt) | "Password must be at least 8 characters" |

Role selalu `user`; field `role` dari request diabaikan. Di frontend (`/register`), form juga memvalidasi field `confirmPassword` (Re-enter Password) harus sama dengan `password` (`"Passwords do not match"`) sebelum mengirim `{ name, email, password }`.

Response `201`:
```json
{ "message": "Registration successful, please sign in.", "user": { "id": 2, "name": "Budi Santoso", "email": "budi@contoh.com", "role": "user" } }
```
Error: `400` data tidak valid / `"Email is already registered"`.

#### 2. `POST /api/auth/login` — Publik

Request:
```json
{ "email": "budi@contoh.com", "password": "rahasia123" }
```
Response `200`:
```json
{ "token": "<jwt>", "user": { "id": 2, "name": "Budi Santoso", "email": "budi@contoh.com", "role": "user" } }
```
Frontend: simpan ke Zustand (`persist` → `localStorage`). `role === "admin"` → `/admin`, selain itu → `/members`.
Error: `400` validasi, `401` `"Invalid email or password"` (jangan bedakan email tidak ada vs password salah).

#### 3. `GET /api/auth/me` — Login

Dipanggil saat aplikasi dibuka/di-refresh dan ada token tersimpan.

Response `200`:
```json
{ "user": { "id": 2, "name": "Budi Santoso", "email": "budi@contoh.com", "role": "user" } }
```
Error: `401` (token kedaluwarsa/tidak valid atau akun sudah dihapus) → frontend logout + redirect `/login` + toast (`"Session expired, please sign in again."`).

---

### 4.2 Publik: Beranda & Galeri

#### 4. `GET /api/home` — Publik

Response `200`:
```json
{
  "albums": [
    {
      "id": 1,
      "title": "Outing 2019",
      "created_at": "2026-11-10T08:00:00.000Z",
      "photos": [ { "id": 10, "photo_url": "https://res.cloudinary.com/...", "sort_order": 1 } ]
    }
  ],
  "video": {
    "id": 3,
    "title": "Video Perpisahan",
    "youtube_url": "https://youtu.be/xxxx",
    "created_at": "2026-11-12T10:00:00.000Z"
  }
}
```
- `albums` = semua album umum + fotonya (urut `sort_order`). Kosong → `[]`.
- `video` = satu-satunya video. Belum ada → `null` (frontend menyembunyikan bagian video).
- Frontend mengubah `youtube_url` menjadi `https://www.youtube-nocookie.com/embed/<videoId>`.
- Halaman `/admin/video` juga memakai field `video` ini untuk menampilkan video saat ini.

#### 5. `GET /api/albums` — Publik

Response `200`:
```json
{ "albums": [ { "id": 1, "title": "Outing 2019", "created_at": "...", "photos": [ ... ] } ] }
```

---

### 4.3 Warga (Login)

#### 6. `GET /api/warga?search=` — Login

- `search` opsional; mencari di `full_name` (LIKE, placeholder `?`).
- Setiap item hanya membawa **foto kartu** (`sort_order = 1`).

Response `200`:
```json
{ "warga": [ { "id": 1, "full_name": "Siti Rahma", "city": "Bandung", "card_photo_url": "https://res.cloudinary.com/..." } ] }
```
Error: `401`.

#### 7. `GET /api/warga/:id` — Login

Response `200`:
```json
{
  "warga": {
    "id": 1,
    "full_name": "Siti Rahma",
    "city": "Bandung",
    "contact": "IG: @siti",
    "message_impression": "Terima kasih untuk kebersamaannya.",
    "photos": [
      { "id": 101, "photo_url": "https://...", "sort_order": 1 },
      { "id": 102, "photo_url": "https://...", "sort_order": 2 },
      { "id": 103, "photo_url": "https://...", "sort_order": 3 }
    ]
  }
}
```
- `message_impression` hanya untuk ditampilkan (baca saja). Tampilkan sebagai teks biasa, jangan sebagai HTML.
- Tidak ada data album di response ini.

Error: `400` id bukan angka, `401`, `404` `"Biodata not found"`.

---

### 4.4 Admin — Biodata

#### 8. `POST /api/admin/warga` — Admin

`Content-Type: multipart/form-data`

| Field | Tipe | Aturan |
| --- | --- | --- |
| `full_name` | text | Wajib, maks 150 |
| `city` | text | **Wajib**, maks 100 |
| `contact` | text | Opsional, maks 150 |
| `message_impression` | text | Opsional, maks 1000. Hanya bisa diisi lewat endpoint #8 dan #9 |
| `photos` | file (berulang) | Wajib **3–10** file, jpg/png/webp, ≤ 2 MB. Urutan kirim = `sort_order` (file pertama = foto kartu) |

Backend: `upload.array("photos", 10)` → cek jumlah ≥ 3 → upload ke Cloudinary → simpan `warga` + `warga_photos` dalam satu transaksi.

Response `201`: `{ "warga": WargaDetail }`
Error: `400` (validasi/jumlah/format/ukuran foto/kota kosong), `401`, `403`.

#### 9. `PUT /api/admin/warga/:id` — Admin

`Content-Type: multipart/form-data`. Field teks sama seperti #8.

| Field | Tipe | Aturan |
| --- | --- | --- |
| `photo_order` | text (JSON array) | Urutan akhir semua foto. `"existing:<id>"` = foto lama yang dipertahankan, `"new:<index>"` = file baru ke-`index` di `photos`. Contoh: `["existing:102","new:0","existing:101"]` |
| `photos` | file (berulang) | Opsional, foto baru saja |

Aturan:
- Foto lama yang **tidak** ada di `photo_order` → dihapus dari DB dan Cloudinary.
- Total akhir (`photo_order.length`) harus **3–10**, jika tidak → `400`.
- `sort_order` dinomori ulang 1..N sesuai `photo_order`.
- `existing:<id>` harus milik warga ini, jika tidak → `400`.

Response `200`: `{ "warga": WargaDetail }`
Error: `400`, `401`, `403`, `404`.

#### 10. `DELETE /api/admin/warga/:id` — Admin

Ambil semua `public_id` foto → hapus baris warga (foto ikut terhapus karena CASCADE) → hapus file di Cloudinary.

Response `200`: `{ "message": "Biodata deleted successfully" }`
Error: `401`, `403`, `404`.

---

### 4.5 Admin — Akun User (halaman `/admin/users`, alias `/admin/akun`)

#### 11. `GET /api/admin/users` — Admin

Mengembalikan akun dengan `role = 'user'` saja, urut `created_at` terbaru.

Response `200`:
```json
{ "users": [ { "id": 2, "name": "Budi Santoso", "email": "budi@contoh.com", "role": "user", "created_at": "2026-11-11T12:00:00.000Z" } ] }
```
Error: `401`, `403`.

#### 12. `DELETE /api/admin/users/:id` — Admin

- Hanya akun dengan `role = 'user'` yang bisa dihapus. Jika `id` milik admin → `403` `"Admin accounts cannot be deleted"`.
- Setelah dihapus, token lama akun itu otomatis ditolak (middleware `auth` tidak menemukan user → 401).
- Query: `DELETE FROM users WHERE id = ? AND role = 'user'`.

Response `200`: `{ "message": "User account deleted successfully" }`
Error: `400` id bukan angka, `401`, `403`, `404` `"User account not found"`.

---

### 4.6 Admin — Album (umum)

#### 13. `POST /api/admin/albums` — Admin

`Content-Type: multipart/form-data`

| Field | Tipe | Aturan |
| --- | --- | --- |
| `title` | text | Wajib, maks 100 |
| `photos` | file (berulang) | Minimal 1, maksimal 20 per upload, jpg/png/webp, ≤ 2 MB. Urutan kirim = `sort_order` |

Tidak ada field `warga_id` — album adalah album umum.

Response `201`: `{ "album": Album }`
Error: `400`, `401`, `403`.

#### 14. `DELETE /api/admin/albums/:id` — Admin

Ambil `public_id` → hapus baris → hapus file Cloudinary.

Response `200`: `{ "message": "Album deleted successfully" }`
Error: `401`, `403`, `404`.

---

### 4.7 Admin — Video (hanya satu)

#### 15. `POST /api/admin/videos` — Admin

Request:
```json
{ "title": "Farewell Tribute Video", "youtube_url": "https://www.youtube.com/watch?v=xxxx" }
```

| Field | Aturan |
| --- | --- |
| `title` | Wajib, maks 100 |
| `youtube_url` | Wajib, URL dengan host `youtube.com`, `www.youtube.com`, `m.youtube.com`, atau `youtu.be` |

Perilaku: dalam satu transaksi, `DELETE FROM videos` lalu `INSERT` video baru. Hasilnya tabel selalu berisi 1 video.

Response `201`: `{ "message": "Video saved successfully", "video": Video }`
Error: `400` (bukan link YouTube / judul kosong), `401`, `403`.

#### 16. `DELETE /api/admin/videos/:id` — Admin

`id` diambil dari `video.id` pada `GET /api/home`.

Response `200`: `{ "message": "Video deleted successfully" }`
Error: `401`, `403`, `404`.

---

## 5. Status Celah PRD

| # | Topik | Status |
| --- | --- | --- |
| 1 | Daftar video untuk admin | ✅ Tidak perlu: hanya 1 video, dibaca dari `GET /api/home` |
| 2 | Judul video | ✅ Diisi admin |
| 3 | Halaman akun user | ✅ `/admin/users` (alias `/admin/akun`) + endpoint #11 dan #12 |
| 4 | `city` | ✅ Wajib |
| 5 | Validasi daftar | ✅ Nama min 6, password min 8 (+ `confirmPassword` cocok di form frontend) |
| 6 | Paket `cors` dan `@hookform/resolvers` | ✅ Ditambahkan |
| 7 | Format perubahan foto di `PUT /api/admin/warga/:id` | ✅ Memakai format `photo_order` + `photos` baru |
| 8 | Batas maksimal foto per album | ✅ Minimal 1, maksimal 20 per upload (buat & hapus album) |
| 9 | "Mengatur akun" = lihat + hapus saja (tanpa ubah data/role/reset password) | ✅ Dikonfirmasi (lihat daftar & hapus akun user) |
| 10 | Logout tanpa endpoint — cukup hapus token di frontend | Info |
| 11 | Bahasa antarmuka, rute utama Inggris + `GuestRoute`, UI detail member | ✅ Bahasa pesan UI/API Inggris, rute utama Inggris + alias rute lama Indonesia, proteksi `GuestRoute` pada `/login` & `/register` |
