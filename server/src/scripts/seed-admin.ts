import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcrypt'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from '../config/db.js'
import { env } from '../config/env.js'

const BCRYPT_SALT_ROUNDS = 10
const DEFAULT_ADMIN_NAME = 'Admin Warga Halim'

export interface SeedAdminOptions {
  email?: string
  password?: string
  name?: string
}

export interface SeedAdminResult {
  created: boolean
  id: number
  email: string
}

interface ExistingUserRow extends RowDataPacket {
  id: number
  email: string
  role: 'admin' | 'user'
}

/**
 * Seed the single admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.
 * Does not create a duplicate row if the email already exists in `users`.
 */
export async function seedAdminAccount(
  options: SeedAdminOptions = {},
): Promise<SeedAdminResult> {
  const adminEmail = (options.email ?? env.ADMIN_EMAIL).trim().toLowerCase()
  const adminPassword = options.password ?? env.ADMIN_PASSWORD
  const adminName = (options.name ?? DEFAULT_ADMIN_NAME).trim()

  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL is required in server/.env')
  }

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      'ADMIN_PASSWORD in server/.env must be set and at least 8 characters long',
    )
  }

  const [existingRows] = await db.query<ExistingUserRow[]>(
    'SELECT id, email, role FROM users WHERE email = ? LIMIT 1',
    [adminEmail],
  )

  const existing = existingRows[0]
  if (existing) {
    return {
      created: false,
      id: existing.id,
      email: existing.email,
    }
  }

  const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_SALT_ROUNDS)
  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
    [adminName, adminEmail, passwordHash],
  )

  return {
    created: true,
    id: result.insertId,
    email: adminEmail,
  }
}

async function runCli(): Promise<void> {
  try {
    const result = await seedAdminAccount()
    if (result.created) {
      console.log(
        `[seed:admin] Admin account created successfully: ${result.email} (id=${result.id})`,
      )
    } else {
      console.log(
        `[seed:admin] Admin account already exists: ${result.email} (id=${result.id}), skipping duplicate.`,
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
