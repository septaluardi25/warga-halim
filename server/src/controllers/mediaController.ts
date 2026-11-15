import type { NextFunction, Request, Response } from 'express'
import { getUploadedFiles } from '../middlewares/upload.js'
import { parsePositiveIntParam } from '../schemas/commonSchema.js'
import {
  createAlbumSchema,
  parseAlbumPhotoOrder,
  saveVideoSchema,
  updateAlbumSchema,
} from '../schemas/mediaSchema.js'
import {
  addPhotosToAlbum,
  createAlbum,
  deleteAlbum,
  deleteVideo,
  getHomeData,
  listAlbums,
  saveVideo,
  updateAlbum,
} from '../services/mediaService.js'

/** Handle `GET /api/home`. */
export async function getHomeHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getHomeData()
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

/** Handle `GET /api/albums`. */
export async function getAlbumsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const albums = await listAlbums()
    res.status(200).json({ albums })
  } catch (err) {
    next(err)
  }
}

/** Handle `POST /api/admin/albums`. */
export async function createAlbumHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { title } = createAlbumSchema.parse(req.body ?? {})
    const files = getUploadedFiles(req)
    const album = await createAlbum(title, files)
    res.status(201).json({ album })
  } catch (err) {
    next(err)
  }
}

/** Handle `PUT /api/admin/albums/:id`. */
export async function updateAlbumHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID album tidak valid')
    const { title } = updateAlbumSchema.parse(req.body ?? {})
    const bodyRecord = (req.body ?? {}) as Record<string, unknown>
    const photoOrder = parseAlbumPhotoOrder(bodyRecord.photo_order)
    const files = getUploadedFiles(req)
    const album = await updateAlbum(id, title, photoOrder, files)
    res.status(200).json({ message: 'Album berhasil diperbarui', album })
  } catch (err) {
    next(err)
  }
}

/** Handle `DELETE /api/admin/albums/:id`. */
export async function deleteAlbumHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID album tidak valid')
    await deleteAlbum(id)
    res.status(200).json({ message: 'Album berhasil dihapus' })
  } catch (err) {
    next(err)
  }
}

/** Handle `POST /api/admin/albums/:id/photos`. */
export async function addAlbumPhotosHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID album tidak valid')
    const files = getUploadedFiles(req)
    const album = await addPhotosToAlbum(id, files)
    res.status(200).json({ message: 'Foto berhasil ditambahkan ke album', album })
  } catch (err) {
    next(err)
  }
}

/** Handle `POST /api/admin/videos`. */
export async function saveVideoHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = saveVideoSchema.parse(req.body ?? {})
    const video = await saveVideo(input)
    res.status(201).json({ message: 'Video berhasil disimpan', video })
  } catch (err) {
    next(err)
  }
}

/** Handle `DELETE /api/admin/videos/:id`. */
export async function deleteVideoHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID video tidak valid')
    await deleteVideo(id)
    res.status(200).json({ message: 'Video berhasil dihapus' })
  } catch (err) {
    next(err)
  }
}
