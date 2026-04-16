import { Navigate, useLocation } from 'react-router-dom'
import { Loader2, CheckSquare } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

// ─── Full-screen loading spinner ─────────────────────────────────────────────
function AuthSpinner() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
      role="status"
      aria-label="Checking authentication…"
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 65%, #2d1b69 100%)',
      }}
    >
      {/* Logo mark */}
      <div
        className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      >
        <CheckSquare size={28} className="text-white" strokeWidth={2} />
      </div>

      {/* Spinner + label */}
      <div className="flex items-center gap-2.5">
        <Loader2
          size={18}
          className="animate-spin text-indigo-400"
          aria-hidden
        />
        <span className="text-sm font-medium text-white/50 tracking-wide">
          Loading TaskFlow Pro…
        </span>
      </div>

      {/* Subtle progress bar */}
      <div className="mt-2 h-0.5 w-40 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            animation: 'shimmer 1.8s linear infinite',
            backgroundSize: '200% 100%',
          }}
        />
      </div>
    </div>
  )
}

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
/**
 * Wraps any route that requires authentication.
 *
 * Behaviour:
 *  1. While auth state is being determined → full-screen spinner.
 *  2. Not authenticated              → redirect to /login (preserving intended URL).
 *  3. Authenticated                  → render children.
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initialising } = useAuth()
  const location = useLocation()

  // Auth context is still hydrating (e.g. validating token on mount)
  if (initialising) {
    return <AuthSpinner />
  }

  // Not logged in — send to login, but remember where they were headed
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  // All good — render the protected content
  return children
}
