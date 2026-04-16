import api from './api'

export const taskService = {
  async getTasks() {
    const { data } = await api.get('/tasks')
    return data
  },

  async createTask(payload) {
    const { data } = await api.post('/tasks', payload)
    return data
  },
}
