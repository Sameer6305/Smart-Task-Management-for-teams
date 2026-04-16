import axios from 'axios'
import toast from 'react-hot-toast'
import { storage } from '../utils/storage'

// ─────────────────────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000, // 15 s request timeout
})

// ─────────────────────────────────────────────────────────────
// Request Interceptor — attach JWT token
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─────────────────────────────────────────────────────────────
// Response Interceptor — handle errors globally
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  // ✅ Pass successful responses straight through
  (response) => response,

  // ❌ Handle errors
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || error.message

    switch (status) {
      case 400:
        toast.error(message || 'Invalid request. Please check your input.')
        break

      case 401:
        // Session expired or invalid token — clear auth and redirect to login
        storage.clearAuth()
        toast.error('Session expired. Please log in again.')

        // Use location.replace so the back-button won't return to a protected page
        window.location.replace('/login')
        break

      case 403:
        toast.error('You do not have permission to perform this action.')
        break

      case 404:
        toast.error(message || 'The requested resource was not found.')
        break

      case 422:
        toast.error(message || 'Validation failed. Please check your input.')
        break

      case 429:
        toast.error('Too many requests. Please slow down and try again.')
        break

      case 500:
      case 502:
      case 503:
        toast.error('Server error. Please try again later.')
        break

      default:
        if (!error.response) {
          // Network error / CORS / server unreachable
          toast.error('Network error. Please check your connection.')
        } else {
          toast.error(message || 'Something went wrong. Please try again.')
        }
    }

    // Normalise the rejected value to a plain Error with a `status` field
    const normalised       = new Error(message || 'API Error')
    normalised.status      = status
    normalised.originalError = error
    return Promise.reject(normalised)
  },
)

// ─────────────────────────────────────────────────────────────
// Helper — safely extract response.data
// ─────────────────────────────────────────────────────────────
const unwrap = (promise) => promise.then((res) => res.data)

// ─────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
export const authAPI = {
  register: (name, email, password) =>
    unwrap(api.post('/auth/register', { name, email, password })),

  /**
   * Login with credentials.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ token: string, user: object }>}
   */
  login: (email, password) =>
    unwrap(api.post('/auth/login', { email, password })),

  /**
   * Fetch the authenticated user's profile.
   * @returns {Promise<{ user: object }>}
   */
  getProfile: () =>
    unwrap(api.get('/auth/profile')),
}

// ─────────────────────────────────────────────────────────────
// Tasks API
// ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} TaskFilters
 * @property {'todo'|'in-progress'|'done'} [status]
 * @property {'low'|'medium'|'high'}       [priority]
 * @property {number}                       [page]
 * @property {number}                       [limit]
 */

export const tasksAPI = {
  /**
   * Fetch all tasks, optionally filtered.
   * @param {TaskFilters} [filters={}]
   * @returns {Promise<{ tasks: object[], total: number, page: number }>}
   */
  getAll: (filters = {}) => {
    // Strip out undefined / null / empty-string values to keep the query clean
    const params = Object.fromEntries(
      Object.entries(filters).filter(
        ([, v]) => v !== undefined && v !== null && v !== '',
      ),
    )
    return unwrap(api.get('/tasks', { params }))
  },

  /**
   * Create a new task.
   * @param {object} taskData
   * @returns {Promise<{ task: object }>}
   */
  create: async (taskData) => {
    const payload = {
      title: taskData.title,
      description: taskData.description || '',
      status: (taskData.status || 'pending').toLowerCase().replace(" ", "_"),
      priority: (taskData.priority || 'medium').toLowerCase(),
      due_date: taskData.dueDate || taskData.due_date ? new Date(taskData.dueDate || taskData.due_date).toISOString() : null,
    }
    
    console.log("TASK PAYLOAD:", payload)
    const token = storage.getToken()

    try {
      const response = await api.post('/tasks', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      return response.data
    } catch (error) {
      console.log("ERROR RESPONSE:", error.originalError?.response?.data || error.response?.data)
      throw error
    }
  },

  /**
   * Fetch a single task by ID.
   * @param {string} id
   * @returns {Promise<{ task: object }>}
   */
  getById: (id) =>
    unwrap(api.get(`/tasks/${id}`)),

  /**
   * Update an existing task.
   * @param {string} id
   * @param {object} taskData
   * @returns {Promise<{ task: object }>}
   */
  update: (id, taskData) =>
    unwrap(api.put(`/tasks/${id}`, taskData)),

  /**
   * Delete a task by ID.
   * @param {string} id
   * @returns {Promise<{ message: string }>}
   */
  delete: (id) =>
    unwrap(api.delete(`/tasks/${id}`)),

  /**
   * Fetch aggregate task statistics for the authenticated user.
   * @returns {Promise<{ total: number, byStatus: object, byPriority: object }>}
   */
  getStatistics: () =>
    unwrap(api.get('/tasks/statistics')),
}

// ─────────────────────────────────────────────────────────────
// Named re-exports for convenience
// ─────────────────────────────────────────────────────────────
export const {
  register,
  login,
  getProfile,
} = authAPI

export const {
  getAll   : getAllTasks,
  create   : createTask,
  getById  : getTaskById,
  update   : updateTask,
  delete   : deleteTask,
  getStatistics,
} = tasksAPI

// Default export — raw axios instance (for custom one-off calls)
export default api
