import { useAuth } from '../../hooks/useAuth'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-slate-200 bg-white/70 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">TaskFlow Pro</p>
          <h1 className="text-lg font-semibold text-slate-900">Team Workspace</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
            {user?.name || 'User'}
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
