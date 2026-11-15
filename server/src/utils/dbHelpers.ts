import type { PoolConnection } from 'mysql2/promise'
import { db } from '../config/db.js'

/**
 * Mengonversi nilai waktu MySQL (tipe `Date` atau string tanggal) menjadi string standar ISO-8601 UTC.
 *
 * @param value - Objek Date atau representasi string waktu dari database
 * @returns {string} String ISO-8601 (contoh: '2026-11-15T15:38:32.000Z')
 */
export function toIsoTimestamp(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString()
}

/**
 * Menjalankan callback fungsi di dalam transaksi database MySQL.
 * Otomatis menangani commit jika callback berhasil, rollback jika terjadi kegagalan,
 * dan memastikan pelepasan koneksi pool (`conn.release()`) di blok finally.
 *
 * @param callback - Fungsi asinkron yang menerima koneksi pool aktif
 * @returns {Promise<T>} Nilai balik dari callback yang dieksekusi
 * @throws Teruskan error dari callback setelah rollback transaksi dilakukan
 */
export async function withTransaction<T>(
  callback: (conn: PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const result = await callback(conn)
    await conn.commit()
    return result
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}
