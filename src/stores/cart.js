import { defineStore } from 'pinia'
import axios from '../axios'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: [],
    loading: false,
    error: null,
  }),
  getters: {
    // Total number of distinct items (for the badge)
    itemCount: (state) => state.cartItems.reduce((sum, item) => sum + item.quantity, 0),
    cartTotal: (state) => {
      return state.cartItems.reduce((total, item) => {
        const price = item.product?.discount_price || item.product?.price || 0
        return total + (parseFloat(price) * item.quantity)
      }, 0).toFixed(2)
    }
  },
  actions: {
    async fetchCart() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.loading = true
      try {
        const response = await axios.get('/cart')
        this.cartItems = response.data.data || response.data
      } catch (error) {
        this.error = 'Failed to load cart'
      } finally {
        this.loading = false
      }
    },
    async addToCart(productId, quantity = 1) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        // Handle guest cart or redirect to login
        throw new Error('Please login to add to cart')
      }

      try {
        await axios.post('/cart', { product_id: productId, quantity })
        await this.fetchCart() // Refresh cart from server
      } catch (error) {
        throw error
      }
    },
    async removeFromCart(cartId) {
      try {
        await axios.delete(`/cart/${cartId}`)
        this.cartItems = this.cartItems.filter(item => item.id !== cartId)
      } catch (error) {
        throw error
      }
    },
    clearLocalCart() {
      this.cartItems = []
    },
    async clearCartServer() {
      try {
        await axios.delete('/cart/clear')
        this.clearLocalCart()
      } catch (error) {
        throw error
      }
    }
  }
})
