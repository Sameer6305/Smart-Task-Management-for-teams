import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckSquare,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  UserCircle,
  ChevronDown,
  Zap,
  Shield,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate up-to-2-letter initials from a display name */
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/** Pick a deterministic indigo/violet hue based on the first char */
function avatarColor(name = '') {
  const hues = [
    { bg: '#4f46e5', text: '#fff' }, // indigo-600
    { bg: '#7c3aed', text: '#fff' }, // violet-600
    { bg: '#6366f1', text: '#fff' }, // indigo-500
    { bg: '#8b5cf6', text: '#fff' }, // violet-500
    { bg: '#4338ca', text: '#fff' }, // indigo-700
    { bg: '#6d28d9', text: '#fff' }, // violet-700
  ]
  const index = (name.charCodeAt(0) || 0) % hues.length
  return hues[index]
}

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const isAdmin = role?.toLowerCase() === 'admin'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        isAdmin
          ? 'bg-amber-400/20 text-amber-300'
          : 'bg-indigo-400/20 text-indigo-300'
      }`}
    >
      {isAdmin ? <Shield size={9} /> : <Zap size={9} />}
      {isAdmin ? 'Admin' : 'User'}
    </span>
  )
}

// ─── Avatar circle ────────────────────────────────────────────────────────────
function Avatar({ name, size = 36 }) {
  const initials = getInitials(name)
  const { bg, text } = avatarColor(name)
  return (
    <div
      className="flex flex-shrink-0 select-none items-center justify-center rounded-full text-xs font-bold ring-2 ring-white/20"
      style={{ width: size, height: size, background: bg, color: text }}
      aria-label={`Avatar for ${name}`}
    >
      {initials || <UserCircle size={size * 0.55} />}
    </div>
  )
}

// ─── Dropdown menu item ───────────────────────────────────────────────────────
function DropdownItem({ icon: Icon, label, onClick, danger = false, to }) {
  const cls = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
    danger
      ? 'text-red-400 hover:bg-red-500/10'
      : 'text-white/70 hover:bg-white/10 hover:text-white'
  }`

  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick}>
        <Icon size={16} />
        {label}
      </Link>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      <Icon size={16} />
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────────────────────────────────────
export default function Navbar({ notificationCount = 0, onMobileMenuToggle }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [profileOpen,  setProfileOpen]  = useState(false)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [scrolled,     setScrolled]     = useState(false)

  const profileRef = useRef(null)
  const notifRef   = useRef(null)

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    if (profileOpen || notifOpen) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [profileOpen, notifOpen])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setProfileOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const toggleProfile = () => {
    setProfileOpen((v) => !v)
    setNotifOpen(false)
  }
  const toggleNotif = () => {
    setNotifOpen((v) => !v)
    setProfileOpen(false)
  }
  const toggleMobile = () => {
    setMobileOpen((v) => !v)
    onMobileMenuToggle?.(!mobileOpen)
  }

  const displayName = user?.name || 'User'
  const displayRole = user?.role || 'user'
  const badgeCount  = Math.min(notificationCount, 99)

  return (
    <header
      className="sticky top-0 z-[200] w-full transition-shadow duration-300"
      style={{
        background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 50%, #6d28d9 100%)',
        boxShadow: scrolled
          ? '0 4px 24px -4px rgba(99,102,241,0.5), 0 1px 0 rgba(255,255,255,0.06)'
          : '0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Subtle noise texture ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">

        {/* ── LEFT: Logo ── */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3 group"
          aria-label="TaskFlow Pro home"
        >
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform duration-200 group-hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <CheckSquare size={20} className="text-white" strokeWidth={2.2} />
          </div>
          <div className="hidden sm:block">
            <p className="text-[15px] font-bold leading-none tracking-tight text-white">
              TaskFlow{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg,#a5b4fc,#c4b5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Pro
              </span>
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-indigo-300/80">
              Team Workspace
            </p>
          </div>
        </Link>

        {/* ── RIGHT: Actions ── */}
        <div className="flex items-center gap-1.5">

          {/* ── Notification bell ── */}
          <div className="relative" ref={notifRef}>
            <button
              id="navbar-notification-btn"
              type="button"
              onClick={toggleNotif}
              aria-label={`${badgeCount} notifications`}
              aria-expanded={notifOpen}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <Bell size={19} />
              {badgeCount > 0 && (
                <span
                  className="absolute right-1.5 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                  style={{ background: '#ef4444' }}
                  aria-hidden
                >
                  {badgeCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {notifOpen && (
              <div
                className="animate-scale-in absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 py-2 shadow-2xl"
                style={{
                  background: 'rgba(30,27,75,0.95)',
                  backdropFilter: 'blur(20px)',
                  transformOrigin: 'top right',
                }}
                role="menu"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 pb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                    Notifications
                  </p>
                  {badgeCount > 0 && (
                    <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                      {badgeCount} new
                    </span>
                  )}
                </div>
                <div className="px-4 py-6 text-center">
                  <Bell size={28} className="mx-auto mb-2 text-white/15" />
                  <p className="text-sm text-white/30">You're all caught up!</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Divider ── */}
          <div className="mx-1 hidden h-6 w-px bg-white/15 sm:block" aria-hidden />

          {/* ── Profile dropdown ── */}
          <div className="relative" ref={profileRef}>
            <button
              id="navbar-profile-btn"
              type="button"
              onClick={toggleProfile}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <Avatar name={displayName} size={34} />

              <div className="hidden text-left sm:block">
                <p className="text-[13px] font-semibold leading-tight text-white">
                  {displayName}
                </p>
                <RoleBadge role={displayRole} />
              </div>

              <ChevronDown
                size={14}
                className={`hidden text-white/50 transition-transform duration-200 sm:block ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile dropdown panel */}
            {profileOpen && (
              <div
                className="animate-scale-in absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 py-1.5 shadow-2xl"
                style={{
                  background: 'rgba(30,27,75,0.97)',
                  backdropFilter: 'blur(20px)',
                  transformOrigin: 'top right',
                }}
                role="menu"
              >
                {/* User info header */}
                <div className="border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={displayName} size={38} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {displayName}
                      </p>
                      <RoleBadge role={displayRole} />
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <DropdownItem
                    icon={UserCircle}
                    label="Profile"
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                  />
                  <DropdownItem
                    icon={Settings}
                    label="Settings"
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                  />
                </div>

                <div className="border-t border-white/10 p-1.5">
                  <DropdownItem
                    icon={LogOut}
                    label="Sign out"
                    danger
                    onClick={() => {
                      setProfileOpen(false)
                      handleLogout()
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            id="navbar-mobile-menu-btn"
            type="button"
            onClick={toggleMobile}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile nav drawer ── */}
      {mobileOpen && (
        <div
          className="animate-slide-down border-t border-white/10 md:hidden"
          style={{
            background: 'rgba(30,27,75,0.98)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <nav className="flex flex-col gap-1 p-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Profile
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Settings
            </Link>
            <div className="my-1 h-px bg-white/10" />
            <button
              type="button"
              onClick={() => { setMobileOpen(false); handleLogout() }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
