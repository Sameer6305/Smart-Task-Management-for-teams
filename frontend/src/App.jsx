import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'


// ── Layout ──
import AppLayout      from './components/layout/AppLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

// ── Pages ──
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

// ─────────────────────────────────────────────────────────────────────────────
// Custom Toaster configuration
// ─────────────────────────────────────────────────────────────────────────────

const toastOptions = {
  duration: 3000,

  // Base style for all toasts
  style: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize:   '13.5px',
    fontWeight: '500',
    lineHeight: '1.5',
    padding:    '12px 16px',
    borderRadius: '14px',
    maxWidth:   '380px',
    boxShadow:  '0 8px 24px -4px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)',
    border:     '1px solid rgba(255,255,255,0.1)',
    color:      '#0f172a',
    background: '#ffffff',
  },

  success: {
    duration: 3000,
    style: {
      background: '#f0fdf4',
      color:      '#166534',
      border:     '1px solid #bbf7d0',
    },
    iconTheme: {
      primary:   '#16a34a',
      secondary: '#f0fdf4',
    },
  },

  error: {
    duration: 4000,
    style: {
      background: '#fef2f2',
      color:      '#991b1b',
      border:     '1px solid #fecaca',
    },
    iconTheme: {
      primary:   '#dc2626',
      secondary: '#fef2f2',
    },
  },

  loading: {
    duration: Infinity,
    style: {
      background: '#f8fafc',
      color:      '#334155',
      border:     '1px solid #e2e8f0',
    },
    iconTheme: {
      primary:   '#6366f1',
      secondary: '#eef2ff',
    },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      {/* ── Global toast notifications ── */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={10}
        containerStyle={{
          top:   20,
          right: 20,
        }}
        toastOptions={toastOptions}
      />

      {/* ── Route tree ── */}
      <Routes>
        {/* Public — redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — wrapped in AppLayout (Navbar + Sidebar + <Outlet>) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Future protected pages slot in here:
              <Route path="/profile"  element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
          */}
        </Route>

        {/* Catch-all — send unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}
