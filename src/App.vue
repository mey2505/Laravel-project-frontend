<template>
  <!-- Admin routes render their own full-screen layout (sidebar etc.) -->
  <router-view v-if="isAdminRoute" />

  <div v-else class="min-h-screen bg-white flex flex-col">
    <header class="bg-zinc-950 sticky top-0 z-50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center gap-8">
            <router-link to="/" class="flex-shrink-0 flex items-center gap-2">
              <span class="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-zinc-950 font-bold text-sm">B</span>
              <span class="font-script text-xl text-white">Bite</span>
            </router-link>
            <div class="hidden sm:flex sm:space-x-8">
              <router-link to="/" class="text-zinc-200 hover:text-amber-400 inline-flex items-center text-sm font-medium transition-colors" :class="{ 'text-amber-400': route.name === 'Home' }">Home</router-link>
              <router-link to="/menu" class="text-zinc-200 hover:text-amber-400 inline-flex items-center text-sm font-medium transition-colors" :class="{ 'text-amber-400': route.name === 'Menu' }">Menu</router-link>
              <router-link v-if="authStore.isAuthenticated" to="/orders" class="text-zinc-200 hover:text-amber-400 inline-flex items-center text-sm font-medium transition-colors sm:hidden lg:inline-flex" :class="{ 'text-amber-400': route.name === 'Orders' }">My Orders</router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Guest Links -->
            <template v-if="!authStore.isAuthenticated">
              <router-link to="/login" class="text-sm font-medium text-zinc-200 hover:text-amber-400 transition-colors">Sign in</router-link>
              <router-link to="/register" class="text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-300 px-3 py-2 rounded-md transition-colors">Create account</router-link>
            </template>
            <!-- Authenticated Links -->
            <template v-else>
              <!-- <router-link to="/orders" class="hidden lg:inline text-sm font-medium text-zinc-200 hover:text-amber-400 transition-colors" :class="{ 'text-amber-400': route.name === 'Orders' }">My Orders</router-link> -->
              <span class="hidden lg:inline text-sm text-zinc-600">|</span>
              <span class="hidden lg:inline text-sm text-zinc-300">Hi, {{ authStore.user?.name }}</span>
              <button @click="handleLogout" class="text-sm font-medium text-zinc-200 hover:text-amber-400 transition-colors">Sign out</button>
            </template>

            <router-link v-if="authStore.isAuthenticated" to="/wishlist" class="text-zinc-300 hover:text-amber-400 p-2 relative transition-colors">
              <span class="sr-only">Wishlist</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span v-if="wishlistStore.count > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-zinc-950 transform translate-x-1/2 -translate-y-1/2 bg-amber-400 rounded-full">{{ wishlistStore.count }}</span>
            </router-link>

            <router-link to="/cart" class="text-zinc-300 hover:text-amber-400 p-2 relative transition-colors">
              <span class="sr-only">Shopping Cart</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <!-- Cart Badge -->
              <span v-if="cartStore.itemCount > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-zinc-950 transform translate-x-1/2 -translate-y-1/2 bg-amber-400 rounded-full">{{ cartStore.itemCount }}</span>
            </router-link>
          </div>
        </div>
      </nav>
    </header>

    <main class="flex-grow w-full">
      <router-view></router-view>
    </main>

    <footer class="bg-zinc-950 border-t border-zinc-800 mt-auto">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-zinc-500">
          &copy; {{ new Date().getFullYear() }} Bite. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import { useWishlistStore } from './stores/wishlist'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

onMounted(async () => {
  // Check auth status on mount
  await authStore.fetchUser()
  if (authStore.isAuthenticated && !authStore.isAdmin) {
    cartStore.fetchCart()
    wishlistStore.fetchIds()
  }
})

const handleLogout = async () => {
  await authStore.logout()
  cartStore.clearLocalCart()
  wishlistStore.clearLocal()
  router.push('/')
}
</script>
