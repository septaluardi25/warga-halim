import type { NextFunction, Request, Response } from 'express'
import { getUploadedFiles } from '../middlewares/upload.js'
import { parsePositiveIntParam } from '../schemas/commonSchema.js'
import { parsePhotoOrder, wargaFieldsSchema } from '../schemas/wargaSchema.js'
import {
  createWarga,
  deleteWarga,
  getWargaById,
  listWarga,
  updateWarga,
} from '../services/wargaService.js'

/** Handle `GET /api/warga?search=`. */
export async function listWargaHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : ''
    const warga = await listWarga(search)
    res.status(200).json({ warga })
  } catch (err) {
    next(err)
  }
}

/** Handle `GET /api/warga/:id`. */
export async function getWargaDetailHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'Invalid member ID')
    const warga = await getWargaById(id)
    res.status(200).json({ warga })
  } catch (err) {
    next(err)
  }
}

/** Handle `POST /api/admin/warga`. */
export async function createWargaHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = wargaFieldsSchema.parse(req.body ?? {})
    const files = getUploadedFiles(req)
    const warga = await createWarga(input, files)
    res.status(201).json({ warga })
  } catch (err) {
    next(err)
  }
}

/** Handle `PUT /api/admin/warga/:id`. */
export async function updateWargaHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'Invalid member ID')
    const input = wargaFieldsSchema.parse(req.body ?? {})
    const bodyRecord = (req.body ?? {}) as Record<string, unknown>
    const photoOrder = parsePhotoOrder(bodyRecord.photo_order)
    const files = getUploadedFiles(req)
    const warga = await updateWarga(id, input, photoOrder, files)
    res.status(200).json({ warga })
  } catch (err) {
    next(err)
  }
}

/** Handle `DELETE /api/admin/warga/:id`. */
export async function deleteWargaHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'Invalid member ID')
    await deleteWarga(id)
    res.status(200).json({ message: 'Biodata deleted successfully' })
  } catch (err) {
    next(err)
  }
}
