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
| 400 | Validasi Zod gagal, jumlah/format/ukuran foto salah, username sudah terdaftar |
| 401 | Tidak ada token, token tidak valid/kedaluwarsa, akun sudah dihapus, username/password salah |
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
  username: string;
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
  position: string;
  card_photo_url: string | null; // foto sort_order = 1
}

interface WargaDetail {
  id: number;
  full_name: string;
  position: string;
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
{ "name": "Budi Santoso", "username": "budi_santoso", "password": "rahasia123" }
```

| Field | Aturan Zod | Pesan error contoh |
| --- | --- | --- |
| `name` | trim, **min 6**, maks 100 | "Nama minimal 6 karakter" |
| `username` | trim, **min 3**, maks 100, bukan format email (tanpa `@`) | "Username minimal 3 karakter" / "Username tidak valid" |
| `password` | **min 8**, maks 72 (batas bcrypt) | "Password minimal 8 karakter" |

Role selalu `user`; field `role` dari request diabaikan. Di frontend (`/register`), form juga memvalidasi field `confirmPassword` (Re-enter Password) harus sama dengan `password` (`"Konfirmasi password tidak cocok"`) sebelum mengirim `{ name, username, password }`.

Response `201`:
```json
{ "message": "Pendaftaran berhasil, silakan masuk.", "user": { "id": 2, "name": "Budi Santoso", "username": "budi_santoso", "role": "user" } }
```
Error: `400` data tidak valid (`"Username tidak valid"` jika berupa bentuk email) / `"Username sudah terdaftar"`.

#### 2. `POST /api/auth/login` — Publik

Request:
```json
{ "username": "budi_santoso", "password": "rahasia123" }
```
Response `200`:
```json
{ "token": "<jwt>", "user": { "id": 2, "name": "Budi Santoso", "username": "budi_santoso", "role": "user" } }
```
Frontend: simpan ke Zustand (`persist` → `localStorage`). `role === "admin"` → `/admin`, selain itu → `/members`.
Error: `400` validasi (`"Username tidak valid"` jika berupa email), `401` `"Username atau password salah"` (jangan bedakan username tidak ada vs password salah).

#### 3. `GET /api/auth/me` — Login

Dipanggil saat aplikasi dibuka/di-refresh dan ada token tersimpan.

Response `200`:
```json
{ "user": { "id": 2, "name": "Budi Santoso", "username": "budi_santoso", "role": "user" } }
```
Error: `401` (token kedaluwarsa/tidak valid atau akun sudah dihapus) → frontend logout + redirect `/login` + toast (`"Sesi telah berakhir, silakan masuk kembali."`).

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
{
  "warga": [
    {
      "id": 1,
      "full_name": "Siti Rahma",
      "position": "Finance Manager",
      "domicile": "Jakarta Selatan",
      "card_photo_url": "https://res.cloudinary.com/..."
    }
  ]
}
```
Error: `401`.

#### 7. `GET /api/warga/:id` — Login

Response `200`:
```json
{
  "warga": {
    "id": 1,
    "full_name": "Siti Rahma",
    "position": "Finance Manager",
    "birth_date": "1992-04-18",
    "domicile": "Jakarta Selatan",
    "whatsapp_number": "081234567891",
    "social_media": "@sitirahma",
    "contact": "081234567891",
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

Error: `400` id bukan angka, `401`, `404` `"Data warga tidak ditemukan"`.

---

### 4.4 Admin — Biodata

#### 8. `POST /api/admin/warga` — Admin

`Content-Type: multipart/form-data`

| Field | Tipe | Aturan |
| --- | --- | --- |
| `full_name` | text | Wajib, maks 150 |
| `position` | text | **Wajib**, maks 100 |
| `birth_date` | text | **Wajib**, format YYYY-MM-DD |
| `domicile` | text | **Wajib**, maks 150 |
| `whatsapp_number` | text | Opsional, maks 100 |
| `social_media` | text | Opsional, maks 255 |
| `message_impression` | text | Opsional, maks 1000. Hanya bisa diisi lewat endpoint #8 dan #9 |
| `photos` | file (berulang) | Wajib **3–10** file, jpg/png/webp, ≤ 2 MB. Urutan kirim = `sort_order` (file pertama = foto kartu) |

Backend: `upload.array("photos", 10)` → cek jumlah ≥ 3 → upload ke Cloudinary → simpan `warga` + `warga_photos` dalam satu transaksi.

Response `201`: `{ "warga": WargaDetail }`
Error: `400` (validasi/jumlah/format/ukuran foto/field wajib kosong), `401`, `403`.

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

Response `200`: `{ "message": "Data warga berhasil dihapus" }`
Error: `401`, `403`, `404`.

---

### 4.5 Admin — Akun User (halaman `/admin/users`, alias `/admin/akun`)

#### 11. `GET /api/admin/users` — Admin

Mengembalikan akun dengan `role = 'user'` saja, urut `created_at` terbaru.

Response `200`:
```json
{ "users": [ { "id": 2, "name": "Budi Santoso", "username": "budi_santoso", "role": "user", "created_at": "2026-11-11T12:00:00.000Z" } ] }
```
Error: `401`, `403`.

#### 12. `PUT /api/admin/users/:id` — Admin

Memperbarui data profil akun anggota biasa (`role = 'user'`). Hanya field nama (`name`) yang dapat diedit; username dan password bersifat tetap dan tidak dapat diedit demi alasan keamanan dan integritas. Akun dengan role `admin` dilindungi dan tidak dapat diedit melalui endpoint ini.

Request:
```json
{
  "name": "Budi Santoso Putra"
}
```

| Field | Tipe | Aturan |
| --- | --- | --- |
| `name` | string | Wajib, min 6 karakter, maks 100 karakter |

Response `200`:
```json
{
  "message": "Akun pengguna berhasil diperbarui",
  "user": {
    "id": 2,
    "name": "Budi Santoso Putra",
    "username": "budi_santoso",
    "role": "user",
    "created_at": "2026-11-11T12:00:00.000Z"
  }
}
```
Error: `400` validasi nama / id bukan angka, `401`, `403` (`"Akun admin tidak dapat diubah"`), `404` (`"Akun pengguna tidak ditemukan"`).

#### 13. `DELETE /api/admin/users/:id` — Admin

- Hanya akun dengan `role = 'user'` yang bisa dihapus. Jika `id` milik admin → `403` `"Akun admin tidak dapat dihapus"`.
- Setelah dihapus, token lama akun itu otomatis ditolak (middleware `auth` tidak menemukan user → 401).
- Query: `DELETE FROM users WHERE id = ? AND role = 'user'`.

Response `200`: `{ "message": "Akun pengguna berhasil dihapus" }`
Error: `400` id bukan angka, `401`, `403`, `404` `"Akun pengguna tidak ditemukan"`.

---

### 4.6 Admin — Album (umum)

#### 14. `POST /api/admin/albums` — Admin

`Content-Type: multipart/form-data`

| Field | Tipe | Aturan |
| --- | --- | --- |
| `title` | text | Wajib, maks 100 |
| `photos` | file (berulang) | Minimal 1, maksimal 50 per album, jpg/png/webp, ≤ 2 MB. Urutan kirim = `sort_order` |

Tidak ada field `warga_id` — album adalah album umum.

Response `201`: `{ "album": Album }`
Error: `400`, `401`, `403`.

#### 15. `PUT /api/admin/albums/:id` — Admin

Mengubah album: judul album, mengurutkan atau menghapus foto lama (Catatan antarmuka: pada panel admin, formulir Ubah Album difokuskan untuk judul dan manajemen foto lama; penambahan foto baru dilakukan melalui fitur tombol terpisah "+ Tambah Foto" pada endpoint #16 di bawah).

`Content-Type: multipart/form-data`

| Field | Tipe | Aturan |
| --- | --- | --- |
| `title` | text | Wajib, maks 100 karakter |
| `photo_order` | text (JSON array) | Opsional. Urutan akhir seluruh foto. `"existing:<id>"` = foto lama yang dipertahankan, `"new:<index>"` = file baru ke-`index` di `photos`. Contoh: `["existing:4","existing:3","new:0"]` |
| `photos` | file (berulang) | Opsional, foto baru yang diunggah |

Aturan bisnis:
- Jika `photo_order` tidak disertakan dan tidak ada file baru diunggah, hanya judul album (`title`) yang diperbarui.
- Jika `photo_order` disertakan:
  - Jumlah total item pada `photo_order` harus antara 1 sampai 50 foto.
  - Setiap `"existing:<id>"` harus merupakan foto milik album ini.
  - Foto lama yang tidak tercantum dalam `photo_order` akan dihapus dari database `album_photos` dan file fisiknya dihapus dari Cloudinary.
  - Foto lama dan baru diurutkan ulang `sort_order = 1..N`.

Response `200`:
```json
{
  "message": "Album berhasil diperbarui",
  "album": {
    "id": 1,
    "title": "Outing 2019 Revisi",
    "created_at": "...",
    "photos": [ ... ]
  }
}
```
Error: `400` (validasi judul/jumlah foto < 1 atau > 50), `401`, `403`, `404` (`"Album tidak ditemukan"`).

#### 16. `POST /api/admin/albums/:id/photos` — Admin

Menambahkan foto ke album yang sudah ada.

`Content-Type: multipart/form-data`

| Field | Tipe | Aturan |
| --- | --- | --- |
| `photos` | file (berulang) | Minimal 1 file, jpg/png/webp, ≤ 2 MB. Akumulasi total foto lama + baru tidak boleh melebihi 50 foto per album |

Aturan bisnis:
- Menghitung jumlah foto saat ini dalam album (`currentCount`) dan nilai `MAX(sort_order)`.
- Jika `currentCount + files.length > 50`, mengembalikan error `400` dengan pesan: `"Album ini sudah memiliki X foto. Maksimal foto per album adalah 50. Anda hanya dapat menambahkan maksimal Y foto lagi."`.
- Foto baru diunggah ke Cloudinary dan disimpan ke tabel `album_photos` dengan urutan `sort_order = max_sort + 1..N`.

Response `200`:
```json
{
  "message": "Foto berhasil ditambahkan ke album",
  "album": {
    "id": 1,
    "title": "Outing Bersama",
    "created_at": "...",
    "photos": [ ... ]
  }
}
```
Error: `400` (validasi/kuota melebihi 50 foto), `401`, `403`, `404` (`"Album tidak ditemukan"`).

#### 17. `DELETE /api/admin/albums/:id` — Admin

Ambil `public_id` → hapus baris → hapus file Cloudinary.

Response `200`: `{ "message": "Album berhasil dihapus" }`
Error: `401`, `403`, `404`.

---

### 4.7 Admin — Video (hanya satu)

#### 18. `POST /api/admin/videos` — Admin

Request:
```json
{ "title": "Farewell Tribute Video", "youtube_url": "https://www.youtube.com/watch?v=xxxx" }
```

| Field | Aturan |
| --- | --- |
| `title` | Wajib, maks 100 |
| `youtube_url` | Wajib, URL dengan host `youtube.com`, `www.youtube.com`, `m.youtube.com`, atau `youtu.be` |

Perilaku: dalam satu transaksi, `DELETE FROM videos` lalu `INSERT` video baru. Hasilnya tabel selalu berisi 1 video.

Response `201`: `{ "message": "Video berhasil disimpan", "video": Video }`
Error: `400` (bukan link YouTube / judul kosong), `401`, `403`.

#### 19. `DELETE /api/admin/videos/:id` — Admin

`id` diambil dari `video.id` pada `GET /api/home`.

Response `200`: `{ "message": "Video berhasil dihapus" }`
Error: `401`, `403`, `404`.

---

## 5. Status Celah PRD

| # | Topik | Status |
| --- | --- | --- |
| 1 | Daftar video untuk admin | ✅ Tidak perlu: hanya 1 video, dibaca dari `GET /api/home` |
| 2 | Judul video | ✅ Diisi admin |
| 3 | Halaman akun user | ✅ `/admin/users` (alias `/admin/akun`) + endpoint #11 dan #12 |
| 4 | `position` (sebelumnya `city`) | ✅ Wajib diisi (maks 100) |
| 5 | Validasi daftar | ✅ Nama min 6, password min 8 (+ `confirmPassword` cocok di form frontend) |
| 6 | Paket `cors` dan `@hookform/resolvers` | ✅ Ditambahkan |
| 7 | Format perubahan foto di `PUT /api/admin/warga/:id` | ✅ Memakai format `photo_order` + `photos` baru |
| 8 | Batas maksimal foto per album | ✅ Minimal 1, maksimal 50 foto per album (tersedia buat album baru, ubah album via `PUT /api/admin/albums/:id`, dan tambah foto via `POST /api/admin/albums/:id/photos`) |
| 9 | "Mengatur akun" = lihat + hapus saja (tanpa ubah data/role/reset password) | ✅ Dikonfirmasi (lihat daftar & hapus akun user) |
| 10 | Logout tanpa endpoint — cukup hapus token di frontend | Info |
| 11 | Bahasa antarmuka dan warna brand | ✅ Seluruh teks antarmuka dan pesan validasi/API dalam bahasa Indonesia; palet warna utama brand menggunakan **#005A9C** dan **white** |
