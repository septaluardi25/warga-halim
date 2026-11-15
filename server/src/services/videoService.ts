import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from '../config/db.js'
import type { SaveVideoInput } from '../schemas/mediaSchema.js'
import type { Video } from '../types/models.js'
import { AppError } from '../utils/AppError.js'
import { toIsoTimestamp, withTransaction } from '../utils/dbHelpers.js'

interface VideoRow extends RowDataPacket {
  id: number
  title: string
  youtube_url: string
  created_at: Date | string
}

/**
 * Mengambil data video YouTube unggulan aktif dari tabel `videos`.
 * Sesuai aturan PRD, sistem hanya menyimpan maksimal 1 video profil yang ditampilkan di halaman beranda.
 *
 * @returns {Promise<Video | null>} Objek video aktif atau `null` jika belum ada video yang disimpan
 */
export async function getActiveVideo(): Promise<Video | null> {
  const [rows] = await db.query<VideoRow[]>(
    'SELECT id, title, youtube_url, created_at FROM videos ORDER BY id DESC LIMIT 1',
  )
  const row = rows[0]
  if (!row) {
    return null
  }
  return {
    id: row.id,
    title: row.title,
    youtube_url: row.youtube_url,
    created_at: toIsoTimestamp(row.created_at),
  }
}

/**
 * Menyimpan atau mengganti video unggulan YouTube di dalam transaksi database.
 * Menghapus rekaman video lama terlebih dahulu sebelum memasukkan rekaman baru sehingga selalu tepat 1 video.
 *
 * @param input - Objek input data video (`title` dan `youtube_url`)
 * @returns {Promise<Video>} Objek video yang baru disimpan
 */
export async function saveVideo(input: SaveVideoInput): Promise<Video> {
  return withTransaction(async (conn) => {
    await conn.query('DELETE FROM videos')

    const [insertResult] = await conn.query<ResultSetHeader>(
      'INSERT INTO videos (title, youtube_url) VALUES (?, ?)',
      [input.title, input.youtube_url],
    )

    const videoId = insertResult.insertId
    const [rows] = await conn.query<VideoRow[]>(
      'SELECT id, title, youtube_url, created_at FROM videos WHERE id = ? LIMIT 1',
      [videoId],
    )

    const row = rows[0]
    return {
      id: videoId,
      title: row?.title ?? input.title,
      youtube_url: row?.youtube_url ?? input.youtube_url,
      created_at: row
        ? toIsoTimestamp(row.created_at)
        : new Date().toISOString(),
    }
  })
}

/**
 * Menghapus rekaman video unggulan berdasarkan ID uniknya.
 *
 * @param id - ID integer video yang hendak dihapus
 * @returns {Promise<void>}
 * @throws {AppError} 404 jika video dengan ID tersebut tidak ditemukan
 */
export async function deleteVideo(id: number): Promise<void> {
  const [result] = await db.query<ResultSetHeader>(
    'DELETE FROM videos WHERE id = ?',
    [id],
  )
  if (result.affectedRows === 0) {
    throw new AppError('Video tidak ditemukan', 404)
  }
}
