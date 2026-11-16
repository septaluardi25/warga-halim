import type { NextFunction, Request, Response } from 'express'
import { updateAdminUserSchema } from '../schemas/authSchema.js'
import { parsePositiveIntParam } from '../schemas/commonSchema.js'
import {
  deleteRegularUser,
  listRegularUsers,
  updateRegularUser,
} from '../services/userAdminService.js'

/**
 * Menangani pengambilan daftar akun pengguna umum oleh admin (`GET /api/admin/users`).
 * Mengembalikan array akun pengguna dengan role `user` yang diurutkan dari yang terbaru.
 *
 * @param _req - Objek request Express
 * @param res - Objek response Express untuk mengembalikan daftar user (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function listUsersHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await listRegularUsers()
    res.status(200).json({ users })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani penghapusan akun pengguna umum berdasarkan ID (`DELETE /api/admin/users/:id`).
 * Memvalidasi ID parameter, mencegah penghapusan akun berstatus `admin`, dan menghapus akun terkait.
 *
 * @param req - Objek request Express dengan parameter `:id` pengguna
 * @param res - Objek response Express dengan pesan konfirmasi keberhasilan (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function deleteUserHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID pengguna tidak valid')
    await deleteRegularUser(id)
    res.status(200).json({ message: 'Akun pengguna berhasil dihapus' })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani pembaruan profil akun pengguna umum berdasarkan ID (`PUT /api/admin/users/:id`).
 * Hanya field nama (`name`) yang dapat diubah; username dan password tidak diizinkan untuk diubah.
 * Mencegah pembaruan akun berstatus `admin`.
 *
 * @param req - Objek request Express dengan parameter `:id` pengguna dan body pembaruan
 * @param res - Objek response Express dengan data pengguna yang telah diperbarui (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function updateUserHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID pengguna tidak valid')
    const input = updateAdminUserSchema.parse(req.body)
    const user = await updateRegularUser(id, input)
    res.status(200).json({
      message: 'Akun pengguna berhasil diperbarui',
      user,
    })
  } catch (err) {
    next(err)
  }
}
