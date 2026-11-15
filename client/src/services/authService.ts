import type { AdminUserRow, User } from '../types'
import { useAuthStore } from '../store/authStore'
import { apiRequest } from './api'

/** Register a new standard member account (`POST /api/auth/register`). */
export function registerUser(input: {
  name: string
  email: string
  password: string
}): Promise<{ message: string; user: User }> {
  return apiRequest<{ message: string; user: User }>('/auth/register', {
    method: 'POST',
    body: input,
    includeAuth: false,
    skipAuthRedirect: true,
  })
}

/** Sign in with email and password (`POST /api/auth/login`). */
export function loginUser(input: {
  email: string
  password: string
}): Promise<{ token: string; user: User }> {
  return apiRequest<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: input,
    includeAuth: false,
    skipAuthRedirect: true,
  })
}

/** Verify the stored session token and return the active user (`GET /api/auth/me`). */
export function getCurrentUser(token?: string | null): Promise<{ user: User }> {
  const activeToken = token ?? useAuthStore.getState().token
  return apiRequest<{ user: User }>('/auth/me', {
    tokenOverride: activeToken,
    skipAuthRedirect: true,
  })
}

/** Fetch all non-admin registered member accounts (`GET /api/admin/users`). */
export function getAdminUsers(): Promise<{ users: AdminUserRow[] }> {
  return apiRequest<{ users: AdminUserRow[] }>('/admin/users')
}

/** Delete a non-admin member account by ID (`DELETE /api/admin/users/:id`). */
export function deleteAdminUser(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/admin/users/${id}`, {
    method: 'DELETE',
  })
}
