import type { NextFunction, Request, Response } from 'express'
import { getUploadedFiles } from '../middlewares/upload.js'
import { parsePositiveIntParam } from '../schemas/commonSchema.js'
import { createAlbumSchema, saveVideoSchema } from '../schemas/mediaSchema.js'
import {
  createAlbum,
  deleteAlbum,
  deleteVideo,
  getHomeData,
  listAlbums,
  saveVideo,
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

/** Handle `DELETE /api/admin/albums/:id`. */
export async function deleteAlbumHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'Invalid album ID')
    await deleteAlbum(id)
    res.status(200).json({ message: 'Album deleted successfully' })
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
    res.status(201).json({ message: 'Video saved successfully', video })
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
    const id = parsePositiveIntParam(req.params.id, 'Invalid video ID')
    await deleteVideo(id)
    res.status(200).json({ message: 'Video deleted successfully' })
  } catch (err) {
    next(err)
  }
}
