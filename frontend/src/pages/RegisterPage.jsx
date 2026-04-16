import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, isAuthenticated } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await register(form)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Register</h1>
        <p className="mt-2 text-sm text-slate-600">Create your TaskFlow Pro account.</p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          />
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
            minLength={6}
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
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-slate-900" to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
