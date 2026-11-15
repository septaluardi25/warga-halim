import type { NextFunction, Request, Response } from 'express'
import { parsePositiveIntParam } from '../schemas/commonSchema.js'
import {
  deleteRegularUser,
  listRegularUsers,
} from '../services/userAdminService.js'

/** Handle `GET /api/admin/users`. */
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

/** Handle `DELETE /api/admin/users/:id`. */
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
