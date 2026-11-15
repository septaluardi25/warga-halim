import type { AdminUserRow, User } from '../types'

interface MockAccount extends User {
  password: string
  created_at: string
}

const ACCOUNTS_STORAGE_KEY = 'warga-halim-mock-accounts-v2'
const DEMO_PASSWORD = 'simulasi123'

const DEFAULT_ACCOUNTS: MockAccount[] = [
  {
    id: 1,
    name: 'Admin Warga Halim',
    email: 'admin@warga.co',
    password: DEMO_PASSWORD,
    role: 'admin',
    created_at: '2026-11-01T08:00:00.000Z',
  },
  {
    id: 2,
    name: 'Budi Santoso',
    email: 'budi@contoh.com',
    password: DEMO_PASSWORD,
    role: 'user',
    created_at: '2026-11-10T09:15:00.000Z',
  },
  {
    id: 3,
    name: 'Siti Rahma',
    email: 'siti@contoh.com',
    password: DEMO_PASSWORD,
    role: 'user',
    created_at: '2026-11-11T12:30:00.000Z',
  },
]

export const mockDemoCredentials = {
  user: {
    email: 'budi@contoh.com',
    password: DEMO_PASSWORD,
  },
  admin: {
    email: 'admin@warga.co',
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
    email: account.email,
    role: account.role,
  }
}

export async function mockRegister(input: {
  name: string
  email: string
  password: string
}): Promise<{ message: string; user: User }> {
  const accounts = loadMockAccounts()
  const normalizedEmail = input.email.trim().toLowerCase()
  const exists = accounts.some((acc) => acc.email.toLowerCase() === normalizedEmail)
  if (exists) {
    throw new Error('Email is already registered')
  }

  const nextId = accounts.reduce((maxId, acc) => Math.max(maxId, acc.id), 0) + 1
  const newAccount: MockAccount = {
    id: nextId,
    name: input.name.trim(),
    email: normalizedEmail,
    password: input.password,
    role: 'user',
    created_at: new Date().toISOString(),
  }
  accounts.push(newAccount)
  saveMockAccounts(accounts)

  return {
    message: 'Registration successful, please sign in.',
    user: toPublicUser(newAccount),
  }
}

export async function mockLogin(input: {
  email: string
  password: string
}): Promise<{ token: string; user: User }> {
  const accounts = loadMockAccounts()
  const normalizedEmail = input.email.trim().toLowerCase()
  const account = accounts.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail && acc.password === input.password,
  )

  if (!account) {
    throw new Error('Invalid email or password')
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
      email: acc.email,
      role: acc.role,
      created_at: acc.created_at,
    }))
}

export function deleteMockUserAccount(id: number): void {
  const accounts = loadMockAccounts()
  const target = accounts.find((acc) => acc.id === id)
  if (!target) {
    throw new Error('User account not found')
  }
  if (target.role === 'admin') {
    throw new Error('Admin accounts cannot be deleted')
  }
  saveMockAccounts(accounts.filter((acc) => acc.id !== id))
}
