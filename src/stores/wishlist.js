import { defineStore } from 'pinia'
import axios from '../axios'
import { useAuthStore } from './auth'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    products: [],
    ids: [],
    loading: false,
    error: null,
  }),
  getters: {
    count: (state) => state.ids.length,
  },
  actions: {
    // Lightweight check used by product cards / details to render heart state
    isWishlisted(productId) {
      return this.ids.includes(productId)
    },

    async fetchIds() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      try {
        const response = await axios.get('/wishlist/ids')
        this.ids = response.data.data || []
      } catch (error) {
        // Non-fatal — heart icons just won't show filled state
        console.error('Failed to load wishlist ids:', error)
      }
    },

    async fetchWishlist() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/wishlist')
        this.products = response.data.data || []
        this.ids = this.products.map((p) => p.id)
      } catch (error) {
        this.error = 'Failed to load wishlist'
      } finally {
        this.loading = false
      }
    },

    async toggle(productId) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('Please sign in to use your wishlist')
      }

      // Optimistic update
      const wasWishlisted = this.ids.includes(productId)
      if (wasWishlisted) {
        this.ids = this.ids.filter((id) => id !== productId)
        this.products = this.products.filter((p) => p.id !== productId)
      } else {
        this.ids = [...this.ids, productId]
      }

      try {
        const response = await axios.post('/wishlist/toggle', { product_id: productId })
        return response.data.in_wishlist
      } catch (error) {
        // Revert optimistic update on failure
        if (wasWishlisted) {
          this.ids = [...this.ids, productId]
        } else {
          this.ids = this.ids.filter((id) => id !== productId)
        }
        throw error
      }
    },

    clearLocal() {
      this.products = []
      this.ids = []
    },
  },
})
