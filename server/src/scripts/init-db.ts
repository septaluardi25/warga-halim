import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { env } from '../config/env.js'

const DB_NAME_REGEX = /^[a-zA-Z0-9_]+$/

/** Create the configured MySQL database (if missing) and apply `sql/schema.sql`. */
export async function initDatabase(): Promise<void> {
  if (!DB_NAME_REGEX.test(env.DB_NAME)) {
    throw new Error('DB_NAME must contain only letters, numbers, and underscores')
  }

  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const schemaPath = path.resolve(currentDir, '../../sql/schema.sql')
  const schemaSql = await fs.readFile(schemaPath, 'utf8')

  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: true,
  })

  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    )
    await conn.query(`USE \`${env.DB_NAME}\``)
    await conn.query(schemaSql)
  } finally {
    await conn.end()
  }
}

async function runCli(): Promise<void> {
  try {
    await initDatabase()
    console.log(`[db:init] Database "${env.DB_NAME}" and schema initialized successfully.`)
  } catch (err) {
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code?: string }).code)
        : ''
    if (code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(
        `[db:init] MySQL access denied for "${env.DB_USER}@${env.DB_HOST}:${env.DB_PORT}". Update DB_USER / DB_PASSWORD in server/.env.`,
      )
    } else if (code === 'ENOTFOUND' && env.DB_HOST.endsWith('.railway.internal')) {
      console.error(
        `[db:init] Cannot resolve "${env.DB_HOST}" because it is Railway's private internal hostname (unreachable from your PC or Vercel). Set DB_HOST and DB_PORT to Railway's Public TCP Proxy (*.proxy.rlwy.net and its 5-digit port) or set MYSQL_PUBLIC_URL in server/.env.`,
      )
    } else {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[db:init] Failed: ${message}`)
    }
    process.exitCode = 1
  }
}

const currentFilePath = fileURLToPath(import.meta.url)
const executedFilePath = process.argv[1] ? path.resolve(process.argv[1]) : ''

if (currentFilePath === executedFilePath) {
  void runCli()
}
