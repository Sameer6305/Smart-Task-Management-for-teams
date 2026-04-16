import { useState, useMemo } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  CheckSquare,
  ArrowRight,
  Loader2,
  Zap,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

// ─────────────────────────────────────────────────────────────────────────────
// Password strength engine
// ─────────────────────────────────────────────────────────────────────────────
const SPECIAL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/
const NUMBER_RE  = /\d/
const LETTER_RE  = /[a-zA-Z]/

/**
 * @returns {{ score: 0|1|2, label: string, color: string, bars: number }}
 */
function getStrength(password) {
  if (!password) return { score: 0, label: '', color: '', bars: 0 }

  const hasLength  = password.length >= 8
  const hasLetters = LETTER_RE.test(password)
  const hasNumbers = NUMBER_RE.test(password)
  const hasSpecial = SPECIAL_RE.test(password)

  if (hasLength && hasLetters && hasNumbers && hasSpecial)
    return { score: 2, label: 'Strong',  color: '#10b981', bars: 3 }

  if (hasLength && hasLetters && hasNumbers)
    return { score: 1, label: 'Medium',  color: '#f59e0b', bars: 2 }

  return { score: 0, label: 'Weak', color: '#ef4444', bars: 1 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Client-side validation
// ─────────────────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate({ name, email, password, confirmPassword }) {
  if (!name.trim())              return 'Full name is required.'
  if (name.trim().length < 2)   return 'Name must be at least 2 characters.'
  if (!email.trim())             return 'Email is required.'
  if (!EMAIL_RE.test(email))    return 'Please enter a valid email address.'
  if (!password)                 return 'Password is required.'
  if (password.length < 6)      return 'Password must be at least 6 characters.'
  if (password !== confirmPassword)
    return 'Passwords do not match.'
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating label input (identical to LoginPage)
// ─────────────────────────────────────────────────────────────────────────────
function FloatingInput({ id, label, type = 'text', value, onChange, icon: Icon, rightSlot, autoComplete }) {
  const [focused, setFocused] = useState(false)
  const lifted = focused || value.length > 0

  return (
    <div className="relative">
      <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? 'text-indigo-400' : 'text-white/30'}`}>
        <Icon size={16} />
      </div>

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

      {rightSlot && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Password strength indicator
// ─────────────────────────────────────────────────────────────────────────────
function StrengthIndicator({ password }) {
  const strength = useMemo(() => getStrength(password), [password])
  if (!password) return null

  const rules = [
    { met: password.length >= 8,        text: 'At least 8 characters' },
    { met: LETTER_RE.test(password) && NUMBER_RE.test(password), text: 'Letters and numbers' },
    { met: SPECIAL_RE.test(password),   text: 'Special character (e.g. !@#$)' },
  ]

  return (
    <div className="animate-fade-in mt-2 space-y-2.5">
      {/* Segmented bar */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{
              background: i < strength.bars ? strength.color : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
        <span
          className="ml-1 min-w-[46px] text-right text-[11px] font-semibold transition-colors duration-300"
          style={{ color: strength.color || 'rgba(255,255,255,0.3)' }}
        >
          {strength.label}
        </span>
      </div>

      {/* Rule checklist */}
      <ul className="space-y-1">
        {rules.map((rule, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${rule.met ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
              {rule.met
                ? <Check size={10} className="text-emerald-400" strokeWidth={3} />
                : <X     size={10} className="text-white/20"     strokeWidth={2.5} />}
            </span>
            <span className={`text-[11px] transition-colors duration-300 ${rule.met ? 'text-emerald-400' : 'text-white/30'}`}>
              {rule.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Password match indicator
// ─────────────────────────────────────────────────────────────────────────────
function MatchBadge({ password, confirm }) {
  if (!confirm) return null
  const match = password === confirm
  return (
    <p className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-300 ${match ? 'text-emerald-400' : 'text-red-400'}`}>
      {match
        ? <><Check size={11} strokeWidth={3} /> Passwords match</>
        : <><X     size={11} strokeWidth={2.5} /> Passwords do not match</>}
    </p>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RegisterPage
// ─────────────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, isAuthenticated } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword,  setShowPassword]  = useState(false)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [errors,        setErrors]        = useState({})

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const validationError = validate(form)
    if (validationError) {
      toast.error(validationError, { icon: '⚠️' })
      setErrors({ general: validationError })
      return
    }

    try {
      await register({
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
      })

      toast.success('Account created! Welcome to TaskFlow Pro 🎉', {
        duration: 4000,
        style: {
          background: '#312e81',
          color: '#fff',
          border: '1px solid rgba(99,102,241,0.4)',
        },
      })

      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err?.message || 'Registration failed. Please try again.'
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
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }}
        />
        <div
          className="absolute right-1/3 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full opacity-10 blur-2xl"
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
      <div className="animate-fade-in relative z-10 w-full max-w-md" style={{ animationDelay: '0.05s' }}>
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
            <h2 className="text-lg font-semibold text-white">Create your account</h2>
            <p className="mt-0.5 text-sm text-white/40">Join thousands of teams using TaskFlow Pro.</p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="animate-slide-up space-y-4" style={{ animationDelay: '0.2s' }}>

              {/* Name */}
              <FloatingInput
                id="register-name"
                label="Full name"
                type="text"
                value={form.name}
                onChange={set('name')}
                icon={User}
                autoComplete="name"
              />

              {/* Email */}
              <FloatingInput
                id="register-email"
                label="Email address"
                type="email"
                value={form.email}
                onChange={set('email')}
                icon={Mail}
                autoComplete="email"
              />

              {/* Password + strength */}
              <div>
                <FloatingInput
                  id="register-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  icon={Lock}
                  autoComplete="new-password"
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
                <StrengthIndicator password={form.password} />
              </div>

              {/* Confirm password */}
              <div>
                <FloatingInput
                  id="register-confirm-password"
                  label="Confirm password"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  icon={ShieldCheck}
                  autoComplete="new-password"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                      className="text-white/30 transition-colors hover:text-indigo-300 focus:outline-none"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <MatchBadge password={form.password} confirm={form.confirmPassword} />
              </div>
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
            <div className="animate-slide-up mt-6" style={{ animationDelay: '0.25s' }}>
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl
                  px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                  focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: loading
                    ? 'linear-gradient(135deg, #4338ca, #6d28d9)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 8px 24px -4px rgba(99,102,241,0.5)',
                }}
              >
                {/* Shimmer sweep on hover */}
                <span
                  className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"
                  aria-hidden
                />

                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>

            {/* ── Terms note ── */}
            <p
              className="animate-fade-in mt-4 text-center text-[11px] leading-relaxed text-white/25"
              style={{ animationDelay: '0.3s' }}
            >
              By creating an account, you agree to our{' '}
              <span className="cursor-pointer text-white/40 underline-offset-2 hover:underline">Terms of Service</span>{' '}
              and{' '}
              <span className="cursor-pointer text-white/40 underline-offset-2 hover:underline">Privacy Policy</span>.
            </p>
          </form>

          {/* ── Divider ── */}
          <div className="animate-fade-in my-6 flex items-center gap-3" style={{ animationDelay: '0.32s' }}>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/30">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* ── Login link ── */}
          <p className="animate-fade-in text-center text-sm text-white/40" style={{ animationDelay: '0.35s' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300 hover:underline"
            >
              Sign in instead →
            </Link>
          </p>
        </div>

        {/* ── Footer note ── */}
        <p className="animate-fade-in mt-6 text-center text-xs text-white/20" style={{ animationDelay: '0.4s' }}>
          © {new Date().getFullYear()} TaskFlow Pro. All rights reserved.
        </p>
      </div>
    </div>
  )
}
