import { useState, type FormEvent } from 'react'
import { LogIn } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { AuthApiError, login } from './api'
import { LoginMapBackground } from './LoginMapBackground'
import type { User } from './types'

type LoginScreenProps = {
  onAuthenticated: (user: User) => void
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      onAuthenticated(await login(email, password))
    } catch (loginError) {
      setError(loginError instanceof AuthApiError && (loginError.status === 401 || loginError.status === 403)
        ? 'Email or password is incorrect.'
        : 'Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-5 text-foreground">
      <LoginMapBackground />
      <div className="login-map-overlay pointer-events-none absolute inset-0 z-[1]" />

      <form onSubmit={submit} className="glass relative z-10 w-full max-w-sm rounded-3xl bg-card/65 p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-route">
            <span className="h-3 w-3 rounded bg-route-contrast" />
          </span>
          <div>
            <h1 className="text-base font-semibold">Vehicle Telematics</h1>
            <p className="text-xs text-muted-foreground">Sign in to access your fleet</p>
          </div>
        </div>

        <label className="block text-xs font-medium" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@example.com"
          className="mt-2 w-full rounded-xl border border-glass bg-card/70 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />

        <label className="mt-4 block text-xs font-medium" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-glass bg-card/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />

        {error && <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2.5 text-xs text-danger">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-5 w-full rounded-xl">
          <LogIn aria-hidden="true" />
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </main>
  )
}
