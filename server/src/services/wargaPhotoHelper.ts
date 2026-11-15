import type { PoolConnection, RowDataPacket } from 'mysql2/promise'
import type { Photo, WargaDetail } from '../types/models.js'
import { AppError } from '../utils/AppError.js'
import type { UploadedPhotoResult } from './uploadService.js'

export type QueryRunner = Pick<PoolConnection, 'query'>

export interface WargaListRow extends RowDataPacket {
  id: number
  full_name: string
  position: string
  card_photo_url: string | null
}

interface WargaRow extends RowDataPacket {
  id: number
  full_name: string
  position: string
  contact: string | null
  message_impression: string | null
}

export interface WargaPhotoRow extends RowDataPacket {
  id: number
  photo_url: string
  public_id: string
  sort_order: number
}

export interface ParsedOrderToken {
  kind: 'existing' | 'new'
  value: number
}

/** Query a single biodata record with all ordered photos (excluding `public_id`). */
export async function fetchWargaDetail(
  runner: QueryRunner,
  wargaId: number,
): Promise<WargaDetail> {
  const [wargaRows] = await runner.query<WargaRow[]>(
    'SELECT id, full_name, position, contact, message_impression FROM warga WHERE id = ? LIMIT 1',
    [wargaId],
  )
  const wargaRow = wargaRows[0]
  if (!wargaRow) {
    throw new AppError('Data warga tidak ditemukan', 404)
  }

  const [photoRows] = await runner.query<WargaPhotoRow[]>(
    'SELECT id, photo_url, sort_order FROM warga_photos WHERE warga_id = ? ORDER BY sort_order ASC, id ASC',
    [wargaId],
  )
  const photos: Photo[] = photoRows.map((p) => ({
    id: p.id,
    photo_url: p.photo_url,
    sort_order: p.sort_order,
  }))

  return {
    id: wargaRow.id,
    full_name: wargaRow.full_name,
    position: wargaRow.position,
    contact: wargaRow.contact,
    message_impression: wargaRow.message_impression,
    photos,
  }
}

/** Validate `photo_order` tokens against existing DB photo IDs and new uploaded file count. */
export function parseOrderTokens(
  photoOrder: string[],
  existingPhotoIds: Set<number>,
  newFilesCount: number,
): { tokens: ParsedOrderToken[]; keptExistingIds: Set<number> } {
  const tokens: ParsedOrderToken[] = []
  const keptExistingIds = new Set<number>()
  const usedNewIndices = new Set<number>()

  for (const rawToken of photoOrder) {
    const [prefix, rawNum] = rawToken.split(':')
    const num = Number(rawNum)

    if (prefix === 'existing') {
      if (!existingPhotoIds.has(num)) {
        throw new AppError('ID foto lama pada photo_order tidak valid', 400)
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

/** Apply photo deletions, reordering, and newly uploaded inserts inside a transaction. */
export async function syncUpdatedWargaPhotos(
  conn: PoolConnection,
  wargaId: number,
  tokens: ParsedOrderToken[],
  removedPhotos: WargaPhotoRow[],
  newlyUploaded: UploadedPhotoResult[],
): Promise<void> {
  if (removedPhotos.length > 0) {
    const placeholders = removedPhotos.map(() => '?').join(', ')
    await conn.query(
      `DELETE FROM warga_photos WHERE warga_id = ? AND id IN (${placeholders})`,
      [wargaId, ...removedPhotos.map((p) => p.id)],
    )
  }

  for (let idx = 0; idx < tokens.length; idx += 1) {
    const sortOrder = idx + 1
    const token = tokens[idx]
    if (token.kind === 'existing') {
      await conn.query(
        'UPDATE warga_photos SET sort_order = ? WHERE id = ? AND warga_id = ?',
        [sortOrder, token.value, wargaId],
      )
    } else {
      const uploaded = newlyUploaded[token.value]
      await conn.query(
        'INSERT INTO warga_photos (warga_id, photo_url, public_id, sort_order) VALUES (?, ?, ?, ?)',
        [wargaId, uploaded.photo_url, uploaded.public_id, sortOrder],
      )
    }
  }
}
