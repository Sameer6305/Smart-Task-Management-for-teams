import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-4 md:flex-row md:gap-4 md:px-6 md:py-6">
        <Sidebar />
        <main className="mt-4 min-h-[70vh] flex-1 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm md:mt-0 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
