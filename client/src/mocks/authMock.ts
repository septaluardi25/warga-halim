import type { AdminUserRow, User } from '../types'

interface MockAccount extends User {
  password: string
  created_at: string
}

const ACCOUNTS_STORAGE_KEY = 'warga-halim-mock-accounts-v3'
const DEMO_PASSWORD = 'simulasi123'

const DEFAULT_ACCOUNTS: MockAccount[] = [
  {
    id: 1,
    name: 'Admin Warga Halim',
    username: 'admin',
    password: DEMO_PASSWORD,
    role: 'admin',
    created_at: '2026-11-01T08:00:00.000Z',
  },
  {
    id: 2,
    name: 'Budi Santoso',
    username: 'budi_santoso',
    password: DEMO_PASSWORD,
    role: 'user',
    created_at: '2026-11-10T09:15:00.000Z',
  },
  {
    id: 3,
    name: 'Siti Rahma',
    username: 'siti_rahma',
    password: DEMO_PASSWORD,
    role: 'user',
    created_at: '2026-11-11T12:30:00.000Z',
  },
]

export const mockDemoCredentials = {
  user: {
    username: 'budi_santoso',
    password: DEMO_PASSWORD,
  },
  admin: {
    username: 'admin',
    password: DEMO_PASSWORD,
  },
}

function loadMockAccounts(): MockAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS))
      return [...DEFAULT_ACCOUNTS]
    }
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return (parsed as MockAccount[]).map((acc) => ({
        ...acc,
        created_at: acc.created_at ?? '2026-11-10T08:00:00.000Z',
      }))
    }
  } catch {
    // Ignore storage parse error and fall back to default accounts
  }
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS))
  return [...DEFAULT_ACCOUNTS]
}

function saveMockAccounts(accounts: MockAccount[]): void {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
}

function toPublicUser(account: MockAccount): User {
  return {
    id: account.id,
    name: account.name,
    username: account.username,
    role: account.role,
  }
}

export async function mockRegister(input: {
  name: string
  username: string
  password: string
}): Promise<{ message: string; user: User }> {
  const accounts = loadMockAccounts()
  const normalizedUsername = input.username.trim()
  const exists = accounts.some((acc) => acc.username.toLowerCase() === normalizedUsername.toLowerCase())
  if (exists) {
    throw new Error('Username sudah terdaftar')
  }

  const nextId = accounts.reduce((maxId, acc) => Math.max(maxId, acc.id), 0) + 1
  const newAccount: MockAccount = {
    id: nextId,
    name: input.name.trim(),
    username: normalizedUsername,
    password: input.password,
    role: 'user',
    created_at: new Date().toISOString(),
  }
  accounts.push(newAccount)
  saveMockAccounts(accounts)

  return {
    message: 'Pendaftaran berhasil, silakan masuk.',
    user: toPublicUser(newAccount),
  }
}

export async function mockLogin(input: {
  username: string
  password: string
}): Promise<{ token: string; user: User }> {
  const accounts = loadMockAccounts()
  const normalizedUsername = input.username.trim()
  const account = accounts.find(
    (acc) => acc.username.toLowerCase() === normalizedUsername.toLowerCase() && acc.password === input.password,
  )

  if (!account) {
    throw new Error('Username atau password salah')
  }

  return {
    token: `mock-jwt-${account.id}-${account.role}`,
    user: toPublicUser(account),
  }
}

export async function mockVerifyToken(token: string): Promise<User | null> {
  const match = /^mock-jwt-(\d+)-(admin|user)$/.exec(token)
  if (!match) return null

  const id = Number(match[1])
  const role = match[2]
  const accounts = loadMockAccounts()
  const account = accounts.find((acc) => acc.id === id && acc.role === role)
  return account ? toPublicUser(account) : null
}

export function getMockUserAccounts(): AdminUserRow[] {
  return loadMockAccounts()
    .filter((acc) => acc.role === 'user')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((acc) => ({
      id: acc.id,
      name: acc.name,
      username: acc.username,
      role: acc.role,
      created_at: acc.created_at,
    }))
}

export function deleteMockUserAccount(id: number): void {
  const accounts = loadMockAccounts()
  const target = accounts.find((acc) => acc.id === id)
  if (!target) {
    throw new Error('Akun pengguna tidak ditemukan')
  }
  if (target.role === 'admin') {
    throw new Error('Akun admin tidak dapat dihapus')
  }
  const remaining = accounts.filter((acc) => acc.id !== id)
  saveMockAccounts(remaining)
}
