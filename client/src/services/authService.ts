import type { AdminUserRow, User } from '../types'
import { useAuthStore } from '../store/authStore'
import { apiRequest } from './api'

/**
 * Mendaftarkan akun anggota baru (`POST /api/auth/register`).
 *
 * @param input - Objek data pendaftaran (`name`, `username`, `password`)
 * @returns {Promise<{ message: string; user: User }>} Pesan keberhasilan dan data pengguna
 */
export function registerUser(input: {
  name: string
  username: string
  password: string
}): Promise<{ message: string; user: User }> {
  return apiRequest<{ message: string; user: User }>('/auth/register', {
    method: 'POST',
    body: input,
    includeAuth: false,
    skipAuthRedirect: true,
  })
}

/**
 * Melakukan proses masuk pengguna dengan username dan password (`POST /api/auth/login`).
 *
 * @param input - Kredensial masuk (`username` dan `password`)
 * @returns {Promise<{ token: string; user: User }>} Token JWT dan data pengguna
 */
export function loginUser(input: {
  username: string
  password: string
}): Promise<{ token: string; user: User }> {
  return apiRequest<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: input,
    includeAuth: false,
    skipAuthRedirect: true,
  })
}

/**
 * Memverifikasi token sesi yang tersimpan dan mengambil profil pengguna aktif (`GET /api/auth/me`).
 *
 * @param token - Token JWT opsional (menggunakan token di Zustand store jika tidak disediakan)
 * @returns {Promise<{ user: User }>} Data pengguna aktif
 */
export function getCurrentUser(token?: string | null): Promise<{ user: User }> {
  const activeToken = token ?? useAuthStore.getState().token
  return apiRequest<{ user: User }>('/auth/me', {
    tokenOverride: activeToken,
    skipAuthRedirect: true,
  })
}

/**
 * Mengambil daftar seluruh akun anggota biasa dari panel admin (`GET /api/admin/users`).
 *
 * @returns {Promise<{ users: AdminUserRow[] }>} Array data ringkas pengguna
 */
export function getAdminUsers(): Promise<{ users: AdminUserRow[] }> {
  return apiRequest<{ users: AdminUserRow[] }>('/admin/users')
}

/**
 * Memperbarui profil akun anggota biasa berdasarkan ID (`PUT /api/admin/users/:id`).
 * Hanya field nama yang dapat diubah; username dan password tidak dapat diubah.
 *
 * @param id - ID integer akun yang hendak diperbarui
 * @param input - Objek data pembaruan nama
 * @returns {Promise<{ message: string; user: AdminUserRow }>} Pesan status dan data pengguna terbaru
 */
export function updateAdminUser(
  id: number,
  input: { name: string },
): Promise<{ message: string; user: AdminUserRow }> {
  return apiRequest<{ message: string; user: AdminUserRow }>(`/admin/users/${id}`, {
    method: 'PUT',
    body: input,
  })
}

/**
 * Menghapus akun anggota biasa berdasarkan ID (`DELETE /api/admin/users/:id`).
 *
 * @param id - ID integer akun yang hendak dihapus
 * @returns {Promise<{ message: string }>} Pesan status penghapusan
 */
export function deleteAdminUser(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/admin/users/${id}`, {
    method: 'DELETE',
  })
}
