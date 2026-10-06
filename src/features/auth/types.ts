export type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'USER'
  enabled: boolean
  createdAt: string
}
