import api from './api'

export const authService = {
  async register(payload) {
    const { data } = await api.post('/auth/register', payload)
    return data
  },

  async login(payload) {
    const { data } = await api.post('/auth/login', payload)
    return data
  },
}
