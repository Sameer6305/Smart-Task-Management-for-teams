import api from './api'

export const taskService = {
  async getTasks(filters = {}) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    )
    const { data } = await api.get('/tasks', { params })
    return data
  },

  async getStatistics() {
    const { data } = await api.get('/tasks/statistics')
    return data
  },

  async createTask(payload) {
    const { data } = await api.post('/tasks', payload)
    return data
  },

  async updateTask(id, payload) {
    const { data } = await api.put(`/tasks/${id}`, payload)
    return data
  },

  async deleteTask(id) {
    const { data } = await api.delete(`/tasks/${id}`)
    return data
  },

  async getTaskById(id) {
    const { data } = await api.get(`/tasks/${id}`)
    return data
  },
}
