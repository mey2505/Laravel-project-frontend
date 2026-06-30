<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        <div class="text-center mb-8">
          <span class="inline-flex w-12 h-12 rounded-full bg-amber-400 items-center justify-center text-zinc-950 font-bold text-lg mb-3">B</span>
          <h2 class="text-2xl font-bold text-zinc-900">Create your account</h2>
          <p class="mt-1 text-sm text-zinc-500">Join Bite and order in seconds</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleRegister">
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
            {{ authStore.error }}
          </div>

          <div>
            <label for="name" class="block text-sm font-medium text-zinc-700 mb-1.5">Full name</label>
            <input
              id="name"
              type="text"
              v-model="form.name"
              required
              placeholder="Your name"
              class="w-full border border-zinc-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-zinc-700 mb-1.5">Email address</label>
            <input
              id="email"
              type="email"
              v-model="form.email"
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
              required
              placeholder="Min. 8 characters"
              class="w-full border border-zinc-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
          </div>

          <div>
            <label for="password_confirmation" class="block text-sm font-medium text-zinc-700 mb-1.5">Confirm password</label>
            <input
              id="password_confirmation"
              type="password"
              v-model="form.password_confirmation"
              required
              placeholder="Repeat password"
              class="w-full border border-zinc-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold py-2.5 rounded-md transition-colors disabled:opacity-50 mt-2"
          >
            {{ authStore.loading ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-zinc-500">
          Already have an account?
          <router-link to="/login" class="font-medium text-amber-600 hover:text-amber-700">Sign in</router-link>
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
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const handleRegister = async () => {
  try {
    await authStore.register(form)
    await Promise.all([cartStore.fetchCart(), wishlistStore.fetchIds()])
    router.push('/')
  } catch (error) {
    // Error handled in store
  }
}
</script>
