import { defineStore } from 'pinia'
import axios from '../axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => !!state.user?.is_admin,
  },
  actions: {
    _setToken(token) {
      localStorage.setItem('auth_token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },
    _clearToken() {
      localStorage.removeItem('auth_token')
      delete axios.defaults.headers.common['Authorization']
    },
    async fetchUser() {
      const token = localStorage.getItem('auth_token')
      if (!token) return
      try {
        const response = await axios.get('/user')
        this.user = response.data
      } catch {
        // Token invalid or expired — clear it
        this._clearToken()
        this.user = null
      }
    },
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('/login', credentials)
        this._setToken(response.data.token)
        this.user = response.data.user
      } catch (error) {
        this.error = error.response?.data?.message
          || error.response?.data?.errors?.email?.[0]
          || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },
    async register(data) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('/register', data)
        this._setToken(response.data.token)
        this.user = response.data.user
      } catch (error) {
        this.error = error.response?.data?.message
          || error.response?.data?.errors?.email?.[0]
          || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        await axios.post('/logout')
      } finally {
        this._clearToken()
        this.user = null
      }
    }
  }
})
