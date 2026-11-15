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

/**
 * Menghasilkan tanda tangan digital token JWT yang memuat payload `{ id, role }`.
 * Menggunakan rahasia `env.JWT_SECRET` dengan masa berlaku default 1 hari (`env.JWT_EXPIRES_IN`).
 *
 * @param payload - Objek payload yang mencakup ID pengguna dan perannya
 * @returns {string} String token JWT yang telah ditandatangani
 */
export function signAuthToken(payload: JwtTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  }
  return jwt.sign({ id: payload.id, role: payload.role }, env.JWT_SECRET, options)
}

/**
 * Memvalidasi keabsahan dan masa berlaku string token JWT.
 * Memastikan payload token memiliki format ID numerik dan role yang valid.
 *
 * @param token - String token JWT yang diterima dari header Authorization
 * @returns {JwtTokenPayload} Payload token yang berisi `id` dan `role`
 * @throws {AppError} 401 jika token tidak valid atau sudah kedaluwarsa
 */
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
      throw new AppError('Token tidak valid atau telah kedaluwarsa', 401)
    }
    return {
      id: (decoded as { id: number }).id,
      role: (decoded as { role: Role }).role,
    }
  } catch (err) {
    if (err instanceof AppError) {
      throw err
    }
    throw new AppError('Token tidak valid atau telah kedaluwarsa', 401)
  }
}

/**
 * Mencari profil pengguna di database berdasarkan ID uniknya.
 *
 * @param userId - ID integer pengguna yang dicari
 * @returns {Promise<AuthUser | null>} Objek profil pengguna tanpa password hash, atau `null` jika tidak ditemukan
 */
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

/**
 * Mendaftarkan akun anggota baru dengan peran default `user`.
 * Melakukan hashing kata sandi menggunakan algoritma bcrypt (10 salt rounds) dan mencegah duplikasi email.
 *
 * @param input - Objek input registrasi (`name`, `email`, `password`)
 * @returns {Promise<AuthUser>} Data profil akun yang baru terdaftar
 * @throws {AppError} 400 jika email sudah terdaftar sebelumnya
 */
export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const [existingRows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [input.email],
  )
  if (existingRows.length > 0) {
    throw new AppError('Email sudah terdaftar', 400)
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
      throw new AppError('Email sudah terdaftar', 400)
    }
    throw err
  }
}

/**
 * Melakukan proses autentikasi pengguna melalui pencocokan email dan kata sandi.
 * Memverifikasi kecocokan hash bcrypt dan menerbitkan token JWT baru.
 *
 * @param input - Objek input kredensial masuk (`email` dan `password`)
 * @returns {Promise<{ token: string; user: AuthUser }>} Token otentikasi JWT dan data profil pengguna
 * @throws {AppError} 401 jika email tidak terdaftar atau kata sandi tidak cocok
 */
export async function loginUser(
  input: LoginInput,
): Promise<{ token: string; user: AuthUser }> {
  const [rows] = await db.query<UserRow[]>(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
    [input.email],
  )
  const row = rows[0]
  if (!row) {
    throw new AppError('Email atau password salah', 401)
  }

  const isPasswordValid = await bcrypt.compare(input.password, row.password_hash)
  if (!isPasswordValid) {
    throw new AppError('Email atau password salah', 401)
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
