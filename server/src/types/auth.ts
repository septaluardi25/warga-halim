export type Role = 'admin' | 'user'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: Role
}

export interface JwtTokenPayload {
  id: number
  role: Role
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}
