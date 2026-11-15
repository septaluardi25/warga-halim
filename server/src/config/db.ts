import mysql, { type Pool } from 'mysql2/promise'
import { env } from './env.js'

export const db: Pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: process.env.VERCEL ? 3 : 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
})

/** Verify MySQL pool connectivity by acquiring and pinging a connection. */
export async function testDbConnection(): Promise<void> {
  const connection = await db.getConnection()
  try {
    await connection.ping()
  } finally {
    connection.release()
  }
}
