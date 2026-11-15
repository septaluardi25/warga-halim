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

/** Return the single featured YouTube video or `null` when none is saved. */
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

/** Replace the existing YouTube video with a newly saved video inside a transaction. */
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

/** Delete the video with the given `id` or throw HTTP 404 if not found. */
export async function deleteVideo(id: number): Promise<void> {
  const [result] = await db.query<ResultSetHeader>(
    'DELETE FROM videos WHERE id = ?',
    [id],
  )
  if (result.affectedRows === 0) {
    throw new AppError('Video not found', 404)
  }
}
