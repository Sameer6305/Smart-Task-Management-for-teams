import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, isAuthenticated } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Login</h1>
        <p className="mt-2 text-sm text-slate-600">Continue to your TaskFlow Pro workspace.</p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          No account?{' '}
          <Link className="font-semibold text-slate-900" to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
