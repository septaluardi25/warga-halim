import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from '../config/db.js'
import type { Album, Photo } from '../types/models.js'
import { AppError } from '../utils/AppError.js'
import { toIsoTimestamp, withTransaction } from '../utils/dbHelpers.js'
import {
  deletePhotosByPublicIds,
  uploadMultiplePhotos,
  type UploadedPhotoResult,
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
  public_id?: string
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

interface ParsedAlbumOrderToken {
  kind: 'existing' | 'new'
  value: number
}

function parseAlbumOrderTokens(
  photoOrder: string[],
  existingPhotoIds: Set<number>,
  newFilesCount: number,
): { tokens: ParsedAlbumOrderToken[]; keptExistingIds: Set<number> } {
  const tokens: ParsedAlbumOrderToken[] = []
  const keptExistingIds = new Set<number>()
  const usedNewIndices = new Set<number>()

  for (const rawToken of photoOrder) {
    const [prefix, rawNum] = rawToken.split(':')
    const num = Number(rawNum)

    if (prefix === 'existing') {
      if (!existingPhotoIds.has(num)) {
        throw new AppError('ID foto lama pada photo_order tidak valid untuk album ini', 400)
      }
      keptExistingIds.add(num)
      tokens.push({ kind: 'existing', value: num })
      continue
    }

    if (prefix === 'new') {
      if (!Number.isInteger(num) || num < 0 || num >= newFilesCount) {
        throw new AppError('Indeks foto baru pada photo_order tidak valid', 400)
      }
      usedNewIndices.add(num)
      tokens.push({ kind: 'new', value: num })
      continue
    }

    throw new AppError('Format token photo_order tidak valid', 400)
  }

  if (usedNewIndices.size !== newFilesCount) {
    throw new AppError(
      'Jumlah foto baru yang diunggah tidak sesuai dengan entri photo_order',
      400,
    )
  }

  return { tokens, keptExistingIds }
}

/**
 * Update an existing album: title, reorder/delete existing photos,
 * and optionally upload new photos.
 */
export async function updateAlbum(
  id: number,
  title: string,
  photoOrder?: string[],
  files: Express.Multer.File[] = [],
): Promise<Album> {
  const [albumRows] = await db.query<AlbumRow[]>(
    'SELECT id, title, created_at FROM albums WHERE id = ? LIMIT 1',
    [id],
  )
  const albumRow = albumRows[0]
  if (!albumRow) {
    throw new AppError('Album tidak ditemukan', 404)
  }

  const [existingRows] = await db.query<AlbumPhotoRow[]>(
    'SELECT id, album_id, photo_url, public_id, sort_order FROM album_photos WHERE album_id = ?',
    [id],
  )
  const existingIds = new Set(existingRows.map((row) => row.id))

  // If photoOrder is not provided and no files uploaded: just update title
  if (!photoOrder && files.length === 0) {
    await db.query('UPDATE albums SET title = ? WHERE id = ?', [title, id])
    const [photoRows] = await db.query<AlbumPhotoRow[]>(
      'SELECT id, album_id, photo_url, sort_order FROM album_photos WHERE album_id = ? ORDER BY sort_order ASC, id ASC',
      [id],
    )
    return {
      id,
      title,
      created_at: toIsoTimestamp(albumRow.created_at),
      photos: photoRows.map((p) => ({
        id: p.id,
        photo_url: p.photo_url,
        sort_order: p.sort_order,
      })),
    }
  }

  const effectiveOrder = photoOrder ?? Array.from(existingIds).map((pId) => `existing:${pId}`)
  const { tokens, keptExistingIds } = parseAlbumOrderTokens(
    effectiveOrder,
    existingIds,
    files.length,
  )

  if (tokens.length < 1 || tokens.length > 50) {
    throw new AppError('Foto album harus berjumlah antara 1 sampai 50 foto', 400)
  }

  const removedPhotos = existingRows.filter((row) => !keptExistingIds.has(row.id))

  let newlyUploaded: UploadedPhotoResult[] = []
  if (files.length > 0) {
    newlyUploaded = await uploadMultiplePhotos(files, ALBUM_CLOUDINARY_FOLDER)
  }

  try {
    const updatedAlbum = await withTransaction(async (conn) => {
      await conn.query('UPDATE albums SET title = ? WHERE id = ?', [title, id])

      if (removedPhotos.length > 0) {
        const placeholders = removedPhotos.map(() => '?').join(', ')
        await conn.query(
          `DELETE FROM album_photos WHERE album_id = ? AND id IN (${placeholders})`,
          [id, ...removedPhotos.map((p) => p.id)],
        )
      }

      for (let idx = 0; idx < tokens.length; idx += 1) {
        const sortOrder = idx + 1
        const token = tokens[idx]
        if (token.kind === 'existing') {
          await conn.query(
            'UPDATE album_photos SET sort_order = ? WHERE id = ? AND album_id = ?',
            [sortOrder, token.value, id],
          )
        } else {
          const uploaded = newlyUploaded[token.value]
          await conn.query(
            'INSERT INTO album_photos (album_id, photo_url, public_id, sort_order) VALUES (?, ?, ?, ?)',
            [id, uploaded.photo_url, uploaded.public_id, sortOrder],
          )
        }
      }

      const [updatedPhotoRows] = await conn.query<AlbumPhotoRow[]>(
        'SELECT id, album_id, photo_url, sort_order FROM album_photos WHERE album_id = ? ORDER BY sort_order ASC, id ASC',
        [id],
      )

      return {
        id,
        title,
        created_at: toIsoTimestamp(albumRow.created_at),
        photos: updatedPhotoRows.map((p) => ({
          id: p.id,
          photo_url: p.photo_url,
          sort_order: p.sort_order,
        })),
      }
    })

    if (removedPhotos.length > 0) {
      const publicIds = removedPhotos
        .map((p) => String(p.public_id ?? ''))
        .filter(Boolean)
      if (publicIds.length > 0) {
        await deletePhotosByPublicIds(publicIds)
      }
    }

    return updatedAlbum
  } catch (err) {
    if (newlyUploaded.length > 0) {
      await deletePhotosByPublicIds(newlyUploaded.map((p) => p.public_id))
    }
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
