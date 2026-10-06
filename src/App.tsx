import { useEffect, useState } from 'react'
import { AuthApiError, getCurrentUser } from './features/auth/api'
import { LoginScreen } from './features/auth/LoginScreen'
import type { User } from './features/auth/types'
import { Dashboard } from './features/dashboard/Dashboard'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch((error: unknown) => {
        if (!(error instanceof AuthApiError && error.status === 401)) console.error(error)
      })
      .finally(() => setCheckingSession(false))
  }, [])

  if (checkingSession) {
    return <main className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground">Connecting to backend…</main>
  }

  if (!user) return <LoginScreen onAuthenticated={setUser} />
  return <Dashboard />
}

export default App
