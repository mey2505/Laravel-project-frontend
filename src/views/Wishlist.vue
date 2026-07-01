<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-zinc-900">My Wishlist</h1>
        <p class="mt-1 text-zinc-500">Items you've saved for later</p>
      </div>
      <span v-if="wishlistStore.count > 0" class="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-full">
        {{ wishlistStore.count }} item{{ wishlistStore.count !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Not authenticated -->
    <div v-if="!authStore.isAuthenticated" class="text-center py-24">
      <svg class="w-16 h-16 mx-auto text-zinc-200 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <p class="text-zinc-500 mb-4">Sign in to see your saved items</p>
      <router-link to="/login" class="inline-block bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold px-6 py-2.5 rounded-md transition-colors">Sign in</router-link>
    </div>

    <!-- Loading -->
    <div v-else-if="wishlistStore.loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="wishlistStore.products.length === 0" class="text-center py-24">
      <svg class="w-16 h-16 mx-auto text-zinc-200 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <p class="text-zinc-500 mb-4">Your wishlist is empty</p>
      <router-link to="/menu" class="inline-block bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold px-6 py-2.5 rounded-md transition-colors">Browse the menu</router-link>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="product in wishlistStore.products"
        :key="product.id"
        class="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-zinc-100 flex flex-col"
      >
        <!-- Remove button -->
        <button
          @click="removeFromWishlist(product)"
          :disabled="togglingId === product.id"
          class="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 shadow hover:bg-red-50 transition-colors"
          aria-label="Remove from wishlist"
        >
          <svg class="w-4 h-4 text-red-500 fill-red-500" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <!-- Image -->
        <router-link :to="{ name: 'ProductDetails', params: { slug: product.slug } }" class="block relative w-full h-36 bg-zinc-100 overflow-hidden">
          <img
            :src="resolveImageUrl(product.image) || 'https://placehold.co/400x300?text=No+Image'"
            :alt="product.name"
            class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <span v-if="!product.in_stock" class="absolute top-2 left-2 bg-zinc-900/90 text-white text-xs font-semibold px-2 py-1 rounded">Sold out</span>
          <span v-if="product.discount_price" class="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded" :class="{ 'left-20': !product.in_stock }">Sale</span>
        </router-link>

        <!-- Info -->
        <div class="p-4 flex flex-col flex-grow">
          <p class="text-xs text-amber-600 font-medium mb-1">{{ product.category?.name }}</p>
          <router-link :to="{ name: 'ProductDetails', params: { slug: product.slug } }">
            <h3 class="text-sm font-semibold text-zinc-900 hover:text-amber-600 transition-colors line-clamp-2 mb-1">{{ product.name }}</h3>
          </router-link>

          <div v-if="product.reviews_count > 0" class="flex items-center gap-1 mb-2">
            <svg v-for="n in 5" :key="n" class="h-3.5 w-3.5" :class="n <= Math.round(product.reviews_avg) ? 'text-amber-400' : 'text-zinc-200'" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="text-xs text-zinc-400">({{ product.reviews_count }})</span>
          </div>

          <div class="mt-auto flex items-end justify-between gap-2">
            <div>
              <span class="text-base font-bold text-zinc-900">${{ product.discount_price ?? product.price }}</span>
              <span v-if="product.discount_price" class="ml-1.5 text-xs text-zinc-400 line-through">${{ product.price }}</span>
            </div>
            <button
              v-if="product.in_stock"
              @click="addToCart(product)"
              :disabled="addingId === product.id"
              class="btn btn-primary btn-rounded text-xs py-1.5 px-3 disabled:opacity-50"
            >
              {{ addingId === product.id ? 'Adding…' : 'Add to cart' }}
            </button>
            <span v-else class="text-xs text-zinc-400">Out of stock</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="fixed bottom-6 right-6 bg-zinc-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ toast }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { resolveImageUrl } from '../axios'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'

const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const addingId = ref(null)
const togglingId = ref(null)
const toast = ref(null)
let toastTimer = null

const showToast = (msg) => {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 2500)
}

const addToCart = async (product) => {
  addingId.value = product.id
  try {
    await cartStore.addToCart(product.id)
    showToast(`${product.name} added to cart`)
  } catch (e) {
    showToast(e.message || 'Failed to add to cart')
  } finally {
    addingId.value = null
  }
}

const removeFromWishlist = async (product) => {
  togglingId.value = product.id
  try {
    await wishlistStore.toggle(product.id)
    showToast(`${product.name} removed from wishlist`)
  } catch (e) {
    showToast(e.message || 'Failed to update wishlist')
  } finally {
    togglingId.value = null
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    wishlistStore.fetchWishlist()
  }
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
