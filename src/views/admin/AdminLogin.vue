<template>
  <div class="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500 mb-4">
          <svg class="w-6 h-6 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-white">Admin Sign In</h2>
        <p class="mt-1 text-sm text-zinc-400">Manage your store's menu, orders and settings</p>
      </div>

      <form class="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-5" @submit.prevent="handleLogin">
        <div v-if="errorMessage" class="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
          {{ errorMessage }}
        </div>

        <div>
          <label class="block text-sm font-medium text-zinc-300 mb-1.5">Email address</label>
          <input
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
          <input
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold transition-colors disabled:opacity-50"
        >
          {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
        </button>

        <p class="text-center text-xs text-zinc-500">
          <router-link to="/" class="hover:text-zinc-300">&larr; Back to store</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const errorMessage = ref(null)

const handleLogin = async () => {
  errorMessage.value = null
  try {
    await authStore.login(form)

    if (!authStore.isAdmin) {
      errorMessage.value = 'This account does not have admin access.'
      await authStore.logout()
      return
    }

    router.push(route.query.redirect || { name: 'AdminDashboard' })
  } catch (error) {
    errorMessage.value = authStore.error || 'Login failed'
  }
}
</script>
