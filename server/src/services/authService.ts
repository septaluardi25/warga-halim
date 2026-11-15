import bcrypt from 'bcrypt'
import jwt, { type SignOptions } from 'jsonwebtoken'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from '../config/db.js'
import { env } from '../config/env.js'
import type { LoginInput, RegisterInput } from '../schemas/authSchema.js'
import type { AuthUser, JwtTokenPayload, Role } from '../types/auth.js'
import { AppError } from '../utils/AppError.js'

const BCRYPT_SALT_ROUNDS = 10

interface UserRow extends RowDataPacket {
  id: number
  name: string
  email: string
  password_hash: string
  role: Role
}

/** Sign a JWT token containing `{ id, role }` valid for `env.JWT_EXPIRES_IN` (1 day). */
export function signAuthToken(payload: JwtTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  }
  return jwt.sign({ id: payload.id, role: payload.role }, env.JWT_SECRET, options)
}

/** Verify a JWT token and return its `{ id, role }` payload, or throw 401 `AppError`. */
export function verifyAuthToken(token: string): JwtTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET)
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof (decoded as Record<string, unknown>).id !== 'number' ||
      ((decoded as Record<string, unknown>).role !== 'admin' &&
        (decoded as Record<string, unknown>).role !== 'user')
    ) {
      throw new AppError('Invalid or expired token', 401)
    }
    return {
      id: (decoded as { id: number }).id,
      role: (decoded as { role: Role }).role,
    }
  } catch (err) {
    if (err instanceof AppError) {
      throw err
    }
    throw new AppError('Invalid or expired token', 401)
  }
}

/** Fetch an active user by `id` from the database, or return `null` if not found. */
export async function getUserById(userId: number): Promise<AuthUser | null> {
  const [rows] = await db.query<UserRow[]>(
    'SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1',
    [userId],
  )
  const row = rows[0]
  if (!row) {
    return null
  }
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  }
}

/** Register a new user with `role = 'user'` and a bcrypt-hashed password. */
export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const [existingRows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [input.email],
  )
  if (existingRows.length > 0) {
    throw new AppError('Email is already registered', 400)
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS)

  try {
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')",
      [input.name, input.email, passwordHash],
    )

    return {
      id: result.insertId,
      name: input.name,
      email: input.email,
      role: 'user',
    }
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === 'ER_DUP_ENTRY'
    ) {
      throw new AppError('Email is already registered', 400)
    }
    throw err
  }
}

/** Authenticate a user by email and password, returning `{ token, user }`. */
export async function loginUser(
  input: LoginInput,
): Promise<{ token: string; user: AuthUser }> {
  const [rows] = await db.query<UserRow[]>(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
    [input.email],
  )
  const row = rows[0]
  if (!row) {
    throw new AppError('Invalid email or password', 401)
  }

  const isPasswordValid = await bcrypt.compare(input.password, row.password_hash)
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401)
  }

  const user: AuthUser = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  }

  const token = signAuthToken({ id: user.id, role: user.role })
  return { token, user }
}
