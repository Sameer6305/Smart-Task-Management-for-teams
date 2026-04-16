import { Link, useLocation } from 'react-router-dom'

const links = [{ to: '/dashboard', label: 'Dashboard' }]

function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="w-full border-r border-slate-200 bg-white/60 p-4 md:w-64 md:p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Navigation</p>
      <nav className="flex gap-2 md:flex-col">
        {links.map((link) => {
          const active = pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
