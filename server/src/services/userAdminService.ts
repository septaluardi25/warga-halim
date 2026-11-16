import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from '../config/db.js'
import type { Role } from '../types/auth.js'
import type { AdminUserRow } from '../types/models.js'
import { AppError } from '../utils/AppError.js'
import { toIsoTimestamp } from '../utils/dbHelpers.js'

interface UserListRow extends RowDataPacket {
  id: number
  name: string
  username: string
  role: Role
  created_at: Date | string
}

interface TargetUserRow extends RowDataPacket {
  id: number
  role: Role
}

/**
 * Mengambil daftar seluruh akun anggota biasa (`role = 'user'`) dari database.
 * Diurutkan berdasarkan tanggal pendaftaran terbaru (`created_at DESC, id DESC`).
 *
 * @returns {Promise<AdminUserRow[]>} Array data ringkas akun user untuk panel kelola user admin
 */
export async function listRegularUsers(): Promise<AdminUserRow[]> {
  const [rows] = await db.query<UserListRow[]>(
    "SELECT id, name, username, role, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC, id DESC",
  )

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    username: row.username,
    role: row.role,
    created_at: toIsoTimestamp(row.created_at),
  }))
}

/**
 * Menghapus akun pengguna biasa (`role = 'user'`) berdasarkan ID.
 * Melindungi akun admin agar tidak dapat dihapus melalui endpoint ini.
 *
 * @param id - ID integer akun pengguna yang hendak dihapus
 * @returns {Promise<void>}
 * @throws {AppError} 404 jika akun tidak ditemukan; 403 jika akun berstatus admin
 */
export async function deleteRegularUser(id: number): Promise<void> {
  const [rows] = await db.query<TargetUserRow[]>(
    'SELECT id, role FROM users WHERE id = ? LIMIT 1',
    [id],
  )

  const target = rows[0]
  if (!target) {
    throw new AppError('Akun pengguna tidak ditemukan', 404)
  }

  if (target.role === 'admin') {
    throw new AppError('Akun admin tidak dapat dihapus', 403)
  }

  const [result] = await db.query<ResultSetHeader>(
    "DELETE FROM users WHERE id = ? AND role = 'user'",
    [id],
  )
  if (result.affectedRows === 0) {
    throw new AppError('Akun pengguna tidak ditemukan', 404)
  }
}
