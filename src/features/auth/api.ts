import type { User } from './types'

export class AuthApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) throw new AuthApiError(response.status, `Request failed (${response.status}).`)
  return response.json() as Promise<T>
}

export function getCurrentUser() {
  return request<User>('/api/auth/me')
}

export async function login(email: string, password: string) {
  const csrf = await request<{ headerName: string; token: string }>('/api/auth/csrf')
  return request<User>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify({ email, password }),
  })
}
