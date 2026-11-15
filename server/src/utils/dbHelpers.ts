import type { PoolConnection } from 'mysql2/promise'
import { db } from '../config/db.js'

/** Convert a MySQL timestamp (`Date` or `string`) to an ISO-8601 string. */
export function toIsoTimestamp(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString()
}

/** Run `callback` inside a MySQL transaction, handling commit, rollback, and connection release. */
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
