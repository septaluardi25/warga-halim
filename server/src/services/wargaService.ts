import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from '../config/db.js'
import type { WargaFieldsInput } from '../schemas/wargaSchema.js'
import type { WargaDetail, WargaListItem } from '../types/models.js'
import { AppError } from '../utils/AppError.js'
import { withTransaction } from '../utils/dbHelpers.js'
import {
  deletePhotosByPublicIds,
  uploadMultiplePhotos,
  type UploadedPhotoResult,
} from './uploadService.js'
import {
  fetchWargaDetail,
  parseOrderTokens,
  syncUpdatedWargaPhotos,
  type WargaListRow,
  type WargaPhotoRow,
} from './wargaPhotoHelper.js'

const WARGA_CLOUDINARY_FOLDER = 'warga-halim/warga'

/**
 * Mengambil daftar ringkas profil seluruh warga untuk kartu tampilan direktori.
 * Hanya memuat foto kartu pertama (`sort_order = 1`). Mendukung penyaringan nama dengan keyword `search`.
 *
 * @param search - String pencarian nama warga (opsional)
 * @returns {Promise<WargaListItem[]>} Array ringkasan warga (id, nama, posisi, foto kartu)
 */
export async function listWarga(search = ''): Promise<WargaListItem[]> {
  const trimmedSearch = search.trim()
  const searchPattern = trimmedSearch ? `%${trimmedSearch}%` : '%%'

  const [rows] = await db.query<WargaListRow[]>(
    `SELECT w.id, w.full_name, w.position, p.photo_url AS card_photo_url
     FROM warga w
     LEFT JOIN warga_photos p ON p.warga_id = w.id AND p.sort_order = 1
     WHERE w.full_name LIKE ?
     ORDER BY w.full_name ASC, w.id ASC`,
    [searchPattern],
  )

  return rows.map((row) => ({
    id: row.id,
    full_name: row.full_name,
    position: row.position,
    card_photo_url: row.card_photo_url ?? null,
  }))
}

/**
 * Mengambil rincian lengkap profil warga beserta seluruh fotonya yang terurut.
 *
 * @param id - ID integer warga
 * @returns {Promise<WargaDetail>} Data lengkap warga beserta array foto-fotonya
 */
export async function getWargaById(id: number): Promise<WargaDetail> {
  return fetchWargaDetail(db, id)
}

/**
 * Membuat data biodata warga baru dan mengunggah antara 3 sampai 10 foto ke Cloudinary.
 * Seluruh operasi database dieksekusi di dalam transaksi; jika terjadi galat,
 * foto-foto yang sudah terunggah ke Cloudinary akan langsung dibersihkan (rollback).
 *
 * @param input - Data teks warga (`full_name`, `position`, `contact`, `message_impression`)
 * @param files - Array berkas foto Multer (wajib berjumlah 3 sampai 10 berkas)
 * @returns {Promise<WargaDetail>} Data profil warga baru yang tersimpan
 * @throws {AppError} 400 jika jumlah foto kurang dari 3 atau lebih dari 10
 */
export async function createWarga(
  input: WargaFieldsInput,
  files: Express.Multer.File[],
): Promise<WargaDetail> {
  if (files.length < 3 || files.length > 10) {
    throw new AppError('Foto biodata warga harus berjumlah antara 3 sampai 10 foto', 400)
  }

  const uploadedPhotos = await uploadMultiplePhotos(files, WARGA_CLOUDINARY_FOLDER)

  try {
    return await withTransaction(async (conn) => {
      const [result] = await conn.query<ResultSetHeader>(
        'INSERT INTO warga (full_name, position, contact, message_impression) VALUES (?, ?, ?, ?)',
        [input.full_name, input.position, input.contact, input.message_impression],
      )

      const wargaId = result.insertId
      for (let idx = 0; idx < uploadedPhotos.length; idx += 1) {
        const photo = uploadedPhotos[idx]
        await conn.query(
          'INSERT INTO warga_photos (warga_id, photo_url, public_id, sort_order) VALUES (?, ?, ?, ?)',
          [wargaId, photo.photo_url, photo.public_id, idx + 1],
        )
      }

      return fetchWargaDetail(conn, wargaId)
    })
  } catch (err) {
    await deletePhotosByPublicIds(uploadedPhotos.map((p) => p.public_id))
    throw err
  }
}

/**
 * Memperbarui data teks profil warga, menyelaraskan susunan urutan foto (`photo_order`),
 * menghapus foto yang dicopot, dan mengunggah berkas foto baru ke Cloudinary.
 * Memastikan total foto akhir warga tetap berada di rentang 3 sampai 10 foto.
 *
 * @param id - ID unik warga yang diperbarui
 * @param input - Data field teks warga yang baru
 * @param photoOrder - Token susunan urutan foto (`existing:<id>` dan `new:<idx>`)
 * @param files - Berkas foto baru yang diunggah
 * @returns {Promise<WargaDetail>} Data profil warga terupdate
 * @throws {AppError} 404 jika warga tidak ditemukan; 400 jika susunan foto tidak valid
 */
export async function updateWarga(
  id: number,
  input: WargaFieldsInput,
  photoOrder: string[],
  files: Express.Multer.File[],
): Promise<WargaDetail> {
  const [wargaRows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM warga WHERE id = ? LIMIT 1',
    [id],
  )
  if (wargaRows.length === 0) {
    throw new AppError('Data warga tidak ditemukan', 404)
  }

  const [existingRows] = await db.query<WargaPhotoRow[]>(
    'SELECT id, photo_url, public_id, sort_order FROM warga_photos WHERE warga_id = ?',
    [id],
  )
  const existingIds = new Set(existingRows.map((row) => row.id))
  const { tokens, keptExistingIds } = parseOrderTokens(photoOrder, existingIds, files.length)
  const removedPhotos = existingRows.filter((row) => !keptExistingIds.has(row.id))

  let newlyUploaded: UploadedPhotoResult[] = []
  if (files.length > 0) {
    newlyUploaded = await uploadMultiplePhotos(files, WARGA_CLOUDINARY_FOLDER)
  }

  let updatedDetail: WargaDetail
  try {
    updatedDetail = await withTransaction(async (conn) => {
      await conn.query(
        'UPDATE warga SET full_name = ?, position = ?, contact = ?, message_impression = ? WHERE id = ?',
        [input.full_name, input.position, input.contact, input.message_impression, id],
      )
      await syncUpdatedWargaPhotos(conn, id, tokens, removedPhotos, newlyUploaded)
      return fetchWargaDetail(conn, id)
    })
  } catch (err) {
    if (newlyUploaded.length > 0) {
      await deletePhotosByPublicIds(newlyUploaded.map((p) => p.public_id))
    }
    throw err
  }

  if (removedPhotos.length > 0) {
    await deletePhotosByPublicIds(removedPhotos.map((p) => p.public_id))
  }
  return updatedDetail
}

/**
 * Menghapus data warga beserta seluruh rekaman fotonya di database,
 * dan membersihkan seluruh aset berkas foto terkait yang tersimpan di Cloudinary.
 *
 * @param id - ID integer warga yang akan dihapus
 * @returns {Promise<void>}
 * @throws {AppError} 404 jika data warga tidak ditemukan
 */
export async function deleteWarga(id: number): Promise<void> {
  const [wargaRows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM warga WHERE id = ? LIMIT 1',
    [id],
  )
  if (wargaRows.length === 0) {
    throw new AppError('Data warga tidak ditemukan', 404)
  }

  const [photoRows] = await db.query<RowDataPacket[]>(
    'SELECT public_id FROM warga_photos WHERE warga_id = ?',
    [id],
  )
  const publicIds = photoRows.map((row) => String(row.public_id ?? '')).filter(Boolean)

  await db.query('DELETE FROM warga WHERE id = ?', [id])
  if (publicIds.length > 0) {
    await deletePhotosByPublicIds(publicIds)
  }
}
