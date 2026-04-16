import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckSquare,
  ArrowRight,
  Loader2,
  Zap,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

// ─── Validation helpers ────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate({ email, password }) {
  if (!email.trim())          return 'Email is required.'
  if (!EMAIL_RE.test(email))  return 'Please enter a valid email address.'
  if (!password)              return 'Password is required.'
  if (password.length < 6)   return 'Password must be at least 6 characters.'
  return null
}

// ─── Floating label input component ───────────────────────────────────────
function FloatingInput({ id, label, type = 'text', value, onChange, icon: Icon, rightSlot, autoComplete }) {
  const [focused, setFocused] = useState(false)
  const lifted = focused || value.length > 0

  return (
    <div className="relative">
      {/* Left icon */}
      <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? 'text-indigo-400' : 'text-white/30'}`}>
        <Icon size={16} />
      </div>

      {/* Floating label */}
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-10 transition-all duration-200 ${
          lifted
            ? 'top-2 text-[10px] font-semibold tracking-wide text-indigo-300'
            : 'top-1/2 -translate-y-1/2 text-sm text-white/40'
        }`}
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full rounded-xl border bg-white/5 pb-2.5 pl-10 pr-12 pt-6 text-sm text-white
          placeholder-transparent outline-none transition-all duration-200
          ${focused
            ? 'border-indigo-400/60 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]'
            : 'border-white/10 hover:border-white/20'
          }`}
      />

      {/* Right slot (e.g. password toggle) */}
      {rightSlot && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
  )
}

// ─── Main LoginPage component ──────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, isAuthenticated } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})

  // Already logged in — redirect immediately
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    // Client-side validation
    const validationError = validate(form)
    if (validationError) {
      toast.error(validationError, { icon: '⚠️' })
      setErrors({ general: validationError })
      return
    }

    try {
      await login({ email: form.email, password: form.password })
      toast.success('Welcome back! 👋', {
        style: {
          background: '#312e81',
          color: '#fff',
          border: '1px solid rgba(99,102,241,0.4)',
        },
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err?.message || 'Login failed. Please try again.'
      toast.error(msg)
      setErrors({ general: msg })
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12"
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 65%, #2d1b69 100%)',
      }}
    >
      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }}
        />
        <div
          className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full opacity-10 blur-2xl"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)' }}
        />
      </div>

      {/* ── Subtle grid overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden
      />

      {/* ── Glass card ── */}
      <div
        className="animate-fade-in relative z-10 w-full max-w-md"
        style={{ animationDelay: '0.05s' }}
      >
        <div
          className="rounded-3xl border border-white/10 p-8 shadow-2xl sm:p-10"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          {/* ── Logo & heading ── */}
          <div className="animate-slide-up mb-8 text-center" style={{ animationDelay: '0.1s' }}>
            {/* Logo mark */}
            <div className="mb-4 inline-flex items-center justify-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <CheckSquare size={28} className="text-white" strokeWidth={2} />
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              TaskFlow{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Pro
              </span>
            </h1>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-white/50">
              <Zap size={13} className="text-indigo-400" />
              Manage tasks. Ship faster.
            </p>
          </div>

          {/* ── Sub-heading ── */}
          <div className="animate-slide-up mb-6" style={{ animationDelay: '0.15s' }}>
            <h2 className="text-lg font-semibold text-white">Sign in to your account</h2>
            <p className="mt-0.5 text-sm text-white/40">
              Enter your credentials to continue.
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate>
            <div
              className="animate-slide-up space-y-4"
              style={{ animationDelay: '0.2s' }}
            >
              {/* Email */}
              <FloatingInput
                id="login-email"
                label="Email address"
                type="email"
                value={form.email}
                onChange={set('email')}
                icon={Mail}
                autoComplete="email"
              />

              {/* Password */}
              <FloatingInput
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                icon={Lock}
                autoComplete="current-password"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-white/30 transition-colors hover:text-indigo-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>

            {/* ── Remember me + Forgot password row ── */}
            <div
              className="animate-slide-up mt-5 flex items-center justify-between"
              style={{ animationDelay: '0.25s' }}
            >
              <label
                htmlFor="remember-me"
                className="flex cursor-pointer select-none items-center gap-2 text-sm text-white/50 transition-colors hover:text-white/70"
              >
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-indigo-500 focus:ring-indigo-500"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* ── Inline validation error ── */}
            {errors.general && (
              <p
                className="animate-fade-in mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
                role="alert"
              >
                {errors.general}
              </p>
            )}

            {/* ── Submit button ── */}
            <div className="animate-slide-up mt-6" style={{ animationDelay: '0.3s' }}>
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3.5
                  text-sm font-semibold text-white shadow-lg transition-all duration-300
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                  disabled:cursor-not-allowed disabled:opacity-60`}
                style={{
                  background: loading
                    ? 'linear-gradient(135deg, #4338ca, #6d28d9)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 8px 24px -4px rgba(99,102,241,0.5)',
                }}
              >
                {/* Hover shimmer overlay */}
                <span
                  className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"
                  aria-hidden
                />

                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ── Divider ── */}
          <div
            className="animate-fade-in my-6 flex items-center gap-3"
            style={{ animationDelay: '0.35s' }}
          >
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/30">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* ── Register link ── */}
          <p
            className="animate-fade-in text-center text-sm text-white/40"
            style={{ animationDelay: '0.4s' }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300 hover:underline"
            >
              Create one free →
            </Link>
          </p>
        </div>

        {/* ── Footer note ── */}
        <p
          className="animate-fade-in mt-6 text-center text-xs text-white/20"
          style={{ animationDelay: '0.45s' }}
        >
          © {new Date().getFullYear()} TaskFlow Pro. All rights reserved.
        </p>
      </div>
    </div>
  )
}
