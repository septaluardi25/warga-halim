import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from '../config/db.js'
import type { Role } from '../types/auth.js'
import type { AdminUserRow } from '../types/models.js'
import { AppError } from '../utils/AppError.js'
import { toIsoTimestamp } from '../utils/dbHelpers.js'

interface UserListRow extends RowDataPacket {
  id: number
  name: string
  email: string
  role: Role
  created_at: Date | string
}

interface TargetUserRow extends RowDataPacket {
  id: number
  role: Role
}

/** List all non-admin user accounts (`role = 'user'`) sorted newest first. */
export async function listRegularUsers(): Promise<AdminUserRow[]> {
  const [rows] = await db.query<UserListRow[]>(
    "SELECT id, name, email, role, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC, id DESC",
  )

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    created_at: toIsoTimestamp(row.created_at),
  }))
}

/**
 * Delete a `role = 'user'` account by `id`.
 * Rejects missing IDs with 404 and admin accounts with 403.
 */
export async function deleteRegularUser(id: number): Promise<void> {
  const [rows] = await db.query<TargetUserRow[]>(
    'SELECT id, role FROM users WHERE id = ? LIMIT 1',
    [id],
  )

  const target = rows[0]
  if (!target) {
    throw new AppError('User account not found', 404)
  }

  if (target.role === 'admin') {
    throw new AppError('Admin accounts cannot be deleted', 403)
  }

  const [result] = await db.query<ResultSetHeader>(
    "DELETE FROM users WHERE id = ? AND role = 'user'",
    [id],
  )
  if (result.affectedRows === 0) {
    throw new AppError('User account not found', 404)
  }
}
