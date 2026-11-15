import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from '../config/db.js'
import type { Album, Photo } from '../types/models.js'
import { AppError } from '../utils/AppError.js'
import { toIsoTimestamp, withTransaction } from '../utils/dbHelpers.js'
import {
  deletePhotosByPublicIds,
  uploadMultiplePhotos,
} from './uploadService.js'

const ALBUM_CLOUDINARY_FOLDER = 'warga-halim/albums'

interface AlbumRow extends RowDataPacket {
  id: number
  title: string
  created_at: Date | string
}

interface AlbumPhotoRow extends RowDataPacket {
  id: number
  album_id: number
  photo_url: string
  sort_order: number
}

/** List all general albums along with their ordered photos. */
export async function listAlbums(): Promise<Album[]> {
  const [albumRows] = await db.query<AlbumRow[]>(
    'SELECT id, title, created_at FROM albums ORDER BY created_at DESC, id DESC',
  )
  if (albumRows.length === 0) {
    return []
  }

  const [photoRows] = await db.query<AlbumPhotoRow[]>(
    'SELECT id, album_id, photo_url, sort_order FROM album_photos ORDER BY album_id ASC, sort_order ASC, id ASC',
  )

  const photosByAlbumId = new Map<number, Photo[]>()
  for (const photo of photoRows) {
    const list = photosByAlbumId.get(photo.album_id) ?? []
    list.push({
      id: photo.id,
      photo_url: photo.photo_url,
      sort_order: photo.sort_order,
    })
    photosByAlbumId.set(photo.album_id, list)
  }

  return albumRows.map((album) => ({
    id: album.id,
    title: album.title,
    created_at: toIsoTimestamp(album.created_at),
    photos: photosByAlbumId.get(album.id) ?? [],
  }))
}

/** Create a general album with 1–50 uploaded photos inside a transaction. */
export async function createAlbum(
  title: string,
  files: Express.Multer.File[],
): Promise<Album> {
  if (files.length < 1 || files.length > 50) {
    throw new AppError('Foto album harus berjumlah antara 1 sampai 50 foto', 400)
  }

  const uploadedPhotos = await uploadMultiplePhotos(files, ALBUM_CLOUDINARY_FOLDER)

  try {
    return await withTransaction(async (conn) => {
      const [albumInsert] = await conn.query<ResultSetHeader>(
        'INSERT INTO albums (title) VALUES (?)',
        [title],
      )
      const albumId = albumInsert.insertId

      for (let idx = 0; idx < uploadedPhotos.length; idx += 1) {
        const photo = uploadedPhotos[idx]
        await conn.query(
          'INSERT INTO album_photos (album_id, photo_url, public_id, sort_order) VALUES (?, ?, ?, ?)',
          [albumId, photo.photo_url, photo.public_id, idx + 1],
        )
      }

      const [albumRows] = await conn.query<AlbumRow[]>(
        'SELECT id, title, created_at FROM albums WHERE id = ? LIMIT 1',
        [albumId],
      )
      const [photoRows] = await conn.query<AlbumPhotoRow[]>(
        'SELECT id, album_id, photo_url, sort_order FROM album_photos WHERE album_id = ? ORDER BY sort_order ASC, id ASC',
        [albumId],
      )

      const albumRow = albumRows[0]
      return {
        id: albumId,
        title: albumRow?.title ?? title,
        created_at: albumRow
          ? toIsoTimestamp(albumRow.created_at)
          : new Date().toISOString(),
        photos: photoRows.map((p) => ({
          id: p.id,
          photo_url: p.photo_url,
          sort_order: p.sort_order,
        })),
      }
    })
  } catch (err) {
    await deletePhotosByPublicIds(uploadedPhotos.map((p) => p.public_id))
    throw err
  }
}

/** Add 1 or more photos to an existing album up to a total of 50 photos. */
export async function addPhotosToAlbum(
  albumId: number,
  files: Express.Multer.File[],
): Promise<Album> {
  if (files.length < 1) {
    throw new AppError('Pilih minimal 1 foto untuk ditambahkan', 400)
  }

  const [albumRows] = await db.query<AlbumRow[]>(
    'SELECT id, title, created_at FROM albums WHERE id = ? LIMIT 1',
    [albumId],
  )
  const albumRow = albumRows[0]
  if (!albumRow) {
    throw new AppError('Album tidak ditemukan', 404)
  }

  const [countRows] = await db.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count, COALESCE(MAX(sort_order), 0) as max_sort FROM album_photos WHERE album_id = ?',
    [albumId],
  )
  const currentCount = Number(countRows[0]?.count ?? 0)
  const maxSort = Number(countRows[0]?.max_sort ?? 0)

  if (currentCount + files.length > 50) {
    const remaining = Math.max(0, 50 - currentCount)
    throw new AppError(
      `Album sudah memiliki ${currentCount} foto. Maksimal 50 foto per album (tersisa ${remaining} slot).`,
      400,
    )
  }

  const uploadedPhotos = await uploadMultiplePhotos(files, ALBUM_CLOUDINARY_FOLDER)

  try {
    return await withTransaction(async (conn) => {
      for (let idx = 0; idx < uploadedPhotos.length; idx += 1) {
        const photo = uploadedPhotos[idx]
        await conn.query(
          'INSERT INTO album_photos (album_id, photo_url, public_id, sort_order) VALUES (?, ?, ?, ?)',
          [albumId, photo.photo_url, photo.public_id, maxSort + idx + 1],
        )
      }

      const [photoRows] = await conn.query<AlbumPhotoRow[]>(
        'SELECT id, album_id, photo_url, sort_order FROM album_photos WHERE album_id = ? ORDER BY sort_order ASC, id ASC',
        [albumId],
      )

      return {
        id: albumRow.id,
        title: albumRow.title,
        created_at: toIsoTimestamp(albumRow.created_at),
        photos: photoRows.map((p) => ({
          id: p.id,
          photo_url: p.photo_url,
          sort_order: p.sort_order,
        })),
      }
    })
  } catch (err) {
    await deletePhotosByPublicIds(uploadedPhotos.map((p) => p.public_id))
    throw err
  }
}

/** Delete a general album and remove all of its photos from Cloudinary. */
export async function deleteAlbum(id: number): Promise<void> {
  const [albumRows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM albums WHERE id = ? LIMIT 1',
    [id],
  )
  if (albumRows.length === 0) {
    throw new AppError('Album tidak ditemukan', 404)
  }

  const [photoRows] = await db.query<RowDataPacket[]>(
    'SELECT public_id FROM album_photos WHERE album_id = ?',
    [id],
  )
  const publicIds = photoRows.map((row) => String(row.public_id ?? '')).filter(Boolean)

  await db.query('DELETE FROM albums WHERE id = ?', [id])
  if (publicIds.length > 0) {
    await deletePhotosByPublicIds(publicIds)
  }
}
