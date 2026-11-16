import type { PoolConnection, RowDataPacket } from 'mysql2/promise'
import type { Photo, WargaDetail } from '../types/models.js'
import { AppError } from '../utils/AppError.js'
import type { UploadedPhotoResult } from './uploadService.js'

export type QueryRunner = Pick<PoolConnection, 'query'>

export interface WargaListRow extends RowDataPacket {
  id: number
  full_name: string
  position: string
  domicile: string
  card_photo_url: string | null
}

interface WargaRow extends RowDataPacket {
  id: number
  full_name: string
  position: string
  birth_date: string | Date
  domicile: string
  whatsapp_number: string | null
  social_media: string | null
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

/**
 * Mengambil satu rekaman rincian biodata warga beserta seluruh daftar fotonya yang diurutkan (`sort_order ASC`).
 * Field sensitif seperti `public_id` Cloudinary disaring agar tidak terekspos ke klien.
 *
 * @param runner - Eksekutor kueri database (pool atau connection di dalam transaksi)
 * @param wargaId - ID integer warga yang dicari
 * @returns {Promise<WargaDetail>} Data lengkap warga beserta foto-fotonya
 * @throws {AppError} 404 jika warga dengan ID tersebut tidak ditemukan
 */
export async function fetchWargaDetail(
  runner: QueryRunner,
  wargaId: number,
): Promise<WargaDetail> {
  const [wargaRows] = await runner.query<WargaRow[]>(
    `SELECT id, full_name, position, DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date,
            domicile, whatsapp_number, social_media, message_impression
     FROM warga WHERE id = ? LIMIT 1`,
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
    birth_date: String(wargaRow.birth_date),
    domicile: wargaRow.domicile,
    whatsapp_number: wargaRow.whatsapp_number,
    social_media: wargaRow.social_media,
    contact: wargaRow.whatsapp_number,
    message_impression: wargaRow.message_impression,
    photos,
  }
}

/**
 * Mengurai dan memvalidasi token urutan foto biodata warga (`photo_order`).
 * Memastikan setiap token `existing:<id>` mereferensikan foto sah yang dimiliki warga ini,
 * dan setiap token `new:<idx>` cocok dengan indeks array berkas baru yang diunggah.
 *
 * @param photoOrder - Array string token representasi susunan urutan foto
 * @param existingPhotoIds - Set ID foto lama warga dari database
 * @param newFilesCount - Jumlah berkas foto baru yang diunggah
 * @returns Objek yang memuat array token urutan terurai dan Set ID foto lama yang dipertahankan
 * @throws {AppError} 400 jika token tidak valid atau jumlah token baru tidak konsisten
 */
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

/**
 * Menerapkan sinkronisasi foto warga di dalam transaksi database:
 * menghapus foto yang dibuang dari tabel `warga_photos`, memperbarui `sort_order` foto yang bertahan,
 * dan memasukkan data berkas foto baru yang baru saja diunggah ke Cloudinary.
 *
 * @param conn - Koneksi transaksi aktif MySQL
 * @param wargaId - ID warga yang bersangkutan
 * @param tokens - Daftar token urutan foto yang telah divalidasi
 * @param removedPhotos - Array baris foto yang dihapus dari biodata
 * @param newlyUploaded - Array hasil foto baru yang telah diunggah ke Cloudinary
 * @returns {Promise<void>}
 */
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
