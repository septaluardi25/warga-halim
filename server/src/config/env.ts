import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z
    .string()
    .trim()
    .pipe(z.url('CLIENT_URL must be a valid URL'))
    .transform((url) => url.replace(/\/+$/, ''))
    .default('http://localhost:5173'),
  DB_HOST: z.string().trim().min(1, 'DB_HOST is required').default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().trim().min(1, 'DB_USER is required').default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().trim().min(1, 'DB_NAME is required').default('warga_halim'),
  JWT_SECRET: z
    .string()
    .trim()
    .min(16, 'JWT_SECRET must be at least 16 characters')
    .default('dev_jwt_secret_change_in_production'),
  JWT_EXPIRES_IN: z.string().trim().min(1).default('1d'),
  ADMIN_USERNAME: z
    .string()
    .trim()
    .min(3, 'ADMIN_USERNAME must be at least 3 characters')
    .default(process.env.ADMIN_USERNAME || 'admin'),
  ADMIN_EMAIL: z
    .string()
    .trim()
    .default(process.env.ADMIN_EMAIL || 'admin@warga.co'),
  ADMIN_PASSWORD: z.string().default(''),
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
})

export type EnvConfig = z.infer<typeof envSchema>

function applyMysqlUrlFallback(target: NodeJS.ProcessEnv, rawUrl: string | undefined): void {
  if (!rawUrl || !rawUrl.startsWith('mysql://')) return
  try {
    const parsed = new URL(rawUrl)
    if (parsed.hostname) target.DB_HOST = parsed.hostname
    if (parsed.port) target.DB_PORT = parsed.port
    if (parsed.username) target.DB_USER = decodeURIComponent(parsed.username)
    if (parsed.password) target.DB_PASSWORD = decodeURIComponent(parsed.password)
    const dbName = parsed.pathname.replace(/^\/+/, '')
    if (dbName) target.DB_NAME = dbName
  } catch {
    // Let schema validation handle invalid configuration later
  }
}

function normalizeRailwayDbEnv(rawEnv: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const normalized: NodeJS.ProcessEnv = { ...rawEnv }
  if (rawEnv.MYSQL_PUBLIC_URL || rawEnv.MYSQL_URL) {
    applyMysqlUrlFallback(normalized, rawEnv.MYSQL_PUBLIC_URL || rawEnv.MYSQL_URL)
    return normalized
  }

  const usingDefaultLocalDb =
    !rawEnv.DB_HOST || (rawEnv.DB_HOST === 'localhost' && !rawEnv.DB_PASSWORD)
  if (!usingDefaultLocalDb) return normalized

  const railwayHost = rawEnv.RAILWAY_TCP_PROXY_DOMAIN || rawEnv.MYSQLHOST
  const railwayPort = rawEnv.RAILWAY_TCP_PROXY_PORT || rawEnv.MYSQLPORT
  if (railwayHost) normalized.DB_HOST = railwayHost
  if (railwayPort) normalized.DB_PORT = railwayPort
  if (rawEnv.MYSQLUSER) normalized.DB_USER = rawEnv.MYSQLUSER
  if (rawEnv.MYSQLPASSWORD) normalized.DB_PASSWORD = rawEnv.MYSQLPASSWORD
  if (rawEnv.MYSQLDATABASE) normalized.DB_NAME = rawEnv.MYSQLDATABASE

  return normalized
}

export function parseEnv(rawEnv: NodeJS.ProcessEnv): EnvConfig {
  const result = envSchema.safeParse(normalizeRailwayDbEnv(rawEnv))
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `- ${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid environment configuration:\n${details}`)
  }
  return result.data
}

export const env = parseEnv(process.env)
