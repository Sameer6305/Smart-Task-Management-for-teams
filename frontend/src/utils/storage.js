const TOKEN_KEY = 'taskflow_token'
const USER_KEY = 'taskflow_user'

export const storage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY)
  },
  getUser() {
    const value = localStorage.getItem(USER_KEY)
    return value ? JSON.parse(value) : null
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clearUser() {
    localStorage.removeItem(USER_KEY)
  },
  clearAuth() {
    this.clearToken()
    this.clearUser()
  },
}
