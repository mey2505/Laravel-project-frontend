<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex-shrink-0 flex items-center">
              <span class="font-bold text-xl text-indigo-600">MyStore</span>
            </router-link>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link to="/" class="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Home</router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Guest Links -->
            <template v-if="!authStore.isAuthenticated">
              <router-link to="/login" class="text-sm font-medium text-gray-700 hover:text-indigo-600">Sign in</router-link>
              <router-link to="/register" class="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md">Create account</router-link>
            </template>
            <!-- Authenticated Links -->
            <template v-else>
              <router-link to="/orders" class="text-sm font-medium text-gray-700 hover:text-indigo-600">My Orders</router-link>
              <span class="text-sm text-gray-400">|</span>
              <span class="text-sm text-gray-700">Hi, {{ authStore.user?.name }}</span>
              <button @click="handleLogout" class="text-sm font-medium text-gray-700 hover:text-indigo-600">Sign out</button>
            </template>

            <router-link to="/cart" class="text-gray-500 hover:text-gray-700 p-2 relative">
              <span class="sr-only">Shopping Cart</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <!-- Cart Badge -->
              <span v-if="cartStore.itemCount > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{{ cartStore.itemCount }}</span>
            </router-link>
          </div>
        </div>
      </nav>
    </header>

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <router-view></router-view>
    </main>

    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">
          &copy; {{ new Date().getFullYear() }} MyStore. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

onMounted(async () => {
  // Check auth status on mount
  await authStore.fetchUser()
  if (authStore.isAuthenticated) {
    cartStore.fetchCart()
  }
})

const handleLogout = async () => {
  await authStore.logout()
  cartStore.clearLocalCart()
  router.push('/')
}
</script>
