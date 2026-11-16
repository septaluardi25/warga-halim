import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcrypt'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from '../config/db.js'
import { env } from '../config/env.js'

const BCRYPT_SALT_ROUNDS = 10
const DEFAULT_ADMIN_NAME = 'Admin Warga Halim'

export interface SeedAdminOptions {
  username?: string
  email?: string
  password?: string
  name?: string
}

export interface SeedAdminResult {
  created: boolean
  id: number
  username: string
}

interface ExistingUserRow extends RowDataPacket {
  id: number
  username: string
  role: 'admin' | 'user'
}

/**
 * Seed the single admin account from `ADMIN_USERNAME` (or `ADMIN_EMAIL`) and `ADMIN_PASSWORD` in `.env`.
 * Does not create a duplicate row if the username already exists in `users`.
 */
export async function seedAdminAccount(
  options: SeedAdminOptions = {},
): Promise<SeedAdminResult> {
  const adminUsername = (options.username ?? env.ADMIN_USERNAME ?? options.email ?? 'admin').trim()
  const adminPassword = options.password ?? env.ADMIN_PASSWORD
  const adminName = (options.name ?? DEFAULT_ADMIN_NAME).trim()

  if (!adminUsername) {
    throw new Error('ADMIN_USERNAME is required in server/.env')
  }

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      'ADMIN_PASSWORD in server/.env must be set and at least 8 characters long',
    )
  }

  const [existingRows] = await db.query<ExistingUserRow[]>(
    'SELECT id, username, role FROM users WHERE username = ? LIMIT 1',
    [adminUsername],
  )

  const existing = existingRows[0]
  if (existing) {
    return {
      created: false,
      id: existing.id,
      username: existing.username,
    }
  }

  const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_SALT_ROUNDS)
  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, 'admin')",
    [adminName, adminUsername, passwordHash],
  )

  return {
    created: true,
    id: result.insertId,
    username: adminUsername,
  }
}

async function runCli(): Promise<void> {
  try {
    const result = await seedAdminAccount()
    if (result.created) {
      console.log(
        `[seed:admin] Admin account created successfully: ${result.username} (id=${result.id})`,
      )
    } else {
      console.log(
        `[seed:admin] Admin account already exists: ${result.username} (id=${result.id}), skipping duplicate.`,
      )
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[seed:admin] Failed: ${message}`)
    process.exitCode = 1
  } finally {
    await db.end()
  }
}

const currentFilePath = fileURLToPath(import.meta.url)
const executedFilePath = process.argv[1] ? path.resolve(process.argv[1]) : ''

if (currentFilePath === executedFilePath) {
  void runCli()
}
