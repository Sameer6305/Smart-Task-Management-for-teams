import { createContext, createElement, useContext, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { storage } from '../utils/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storage.getUser())
  const [token, setToken] = useState(storage.getToken())
  const [loading, setLoading] = useState(false)

  const persistAuth = (payload) => {
    storage.setToken(payload.token)
    storage.setUser(payload.user)
    setToken(payload.token)
    setUser(payload.user)
  }

  const login = async (credentials) => {
    setLoading(true)
    try {
      const data = await authService.login(credentials)
      persistAuth(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const register = async (details) => {
    setLoading(true)
    try {
      const data = await authService.register(details)
      persistAuth(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    storage.clearAuth()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [user, token, loading],
  )

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
