<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        <div class="text-center mb-8">
          <span class="inline-flex w-12 h-12 rounded-full bg-amber-400 items-center justify-center text-zinc-950 font-bold text-lg mb-3">B</span>
          <h2 class="text-2xl font-bold text-zinc-900">Welcome back</h2>
          <p class="mt-1 text-sm text-zinc-500">Sign in to continue your order</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
            {{ authStore.error }}
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-zinc-700 mb-1.5">Email address</label>
            <input
              id="email"
              type="email"
              v-model="form.email"
              autocomplete="email"
              required
              placeholder="you@example.com"
              class="w-full border border-zinc-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              v-model="form.password"
              autocomplete="current-password"
              required
              placeholder="••••••••"
              class="w-full border border-zinc-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn btn-primary btn-block btn-rounded py-2.5 disabled:opacity-50"
          >
            {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-zinc-500">
          Don't have an account?
          <router-link to="/register" class="font-medium text-amber-600 hover:text-amber-700">Create one</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const form = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  try {
    await authStore.login(form)
    if (authStore.isAdmin) {
      router.push({ name: 'AdminDashboard' })
      return
    }
    await Promise.all([cartStore.fetchCart(), wishlistStore.fetchIds()])
    router.push('/')
  } catch (error) {
    // Error handled in store
  }
}
</script>
