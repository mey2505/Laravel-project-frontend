<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Back -->
    <router-link to="/menu" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 mb-6">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
      Back to menu
    </router-link>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
    </div>

    <div v-else-if="!product" class="text-center py-24 text-zinc-400">Product not found.</div>

    <div v-else>
      <!-- Main product block -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        <!-- Image -->
        <div class="relative rounded-2xl overflow-hidden bg-zinc-100 aspect-square lg:aspect-auto lg:h-[480px]">
          <img
            v-if="resolveImageUrl(product.image)"
            :src="resolveImageUrl(product.image)"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-zinc-300">
            <svg class="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <span v-if="!product.in_stock" class="absolute top-4 left-4 bg-zinc-900/90 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">Sold out</span>
          <span v-if="product.discount_price" class="absolute top-4 right-4 bg-red-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
            Save {{ Math.round((1 - product.discount_price / product.price) * 100) }}%
          </span>
        </div>

        <!-- Info -->
        <div class="flex flex-col">
          <p class="text-sm text-amber-600 font-medium mb-2">{{ product.category?.name }}</p>
          <h1 class="text-3xl font-bold text-zinc-900 leading-snug">{{ product.name }}</h1>

          <!-- Rating -->
          <div v-if="product.reviews_count > 0" class="flex items-center gap-2 mt-3">
            <div class="flex">
              <svg v-for="n in 5" :key="n" class="h-5 w-5" :class="n <= Math.round(product.reviews_avg) ? 'text-amber-400' : 'text-zinc-200'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <span class="text-sm text-zinc-600 font-medium">{{ product.reviews_avg }}</span>
            <a href="#reviews" class="text-sm text-zinc-400 hover:text-zinc-600">
              ({{ product.reviews_count }} review{{ product.reviews_count !== 1 ? 's' : '' }})
            </a>
          </div>
          <div v-else class="mt-3 text-sm text-zinc-400">No reviews yet</div>

          <!-- Description -->
          <p class="mt-5 text-zinc-600 leading-relaxed">{{ product.description }}</p>

          <!-- Price -->
          <div class="mt-6 flex items-baseline gap-3">
            <span class="text-3xl font-bold text-zinc-900">
              ${{ product.discount_price ?? product.price }}
            </span>
            <span v-if="product.discount_price" class="text-xl text-zinc-400 line-through">${{ product.price }}</span>
            <span v-if="product.discount_price" class="text-sm text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded">
              Save ${{ (product.price - product.discount_price).toFixed(2) }}
            </span>
          </div>

          <!-- Stock indicator -->
          <div class="mt-3">
            <span v-if="!product.in_stock" class="text-sm text-red-600 font-medium">Out of stock</span>
            <span v-else-if="product.stock <= 5" class="text-sm text-orange-500 font-medium">Only {{ product.stock }} left!</span>
            <span v-else class="text-sm text-green-600 font-medium">In stock</span>
          </div>

          <!-- Qty + actions -->
          <div class="mt-7 flex items-center gap-3">
            <!-- Quantity picker -->
            <div class="flex items-center border border-zinc-300 rounded-md overflow-hidden">
              <button
                @click="qty = Math.max(1, qty - 1)"
                class="px-3 py-2.5 text-zinc-600 hover:bg-zinc-100 transition-colors text-lg leading-none"
              >−</button>
              <span class="px-4 py-2 text-sm font-semibold text-zinc-900 min-w-[3rem] text-center">{{ qty }}</span>
              <button
                @click="qty = Math.min(product.stock, qty + 1)"
                class="px-3 py-2.5 text-zinc-600 hover:bg-zinc-100 transition-colors text-lg leading-none"
              >+</button>
            </div>

            <!-- Add to cart -->
            <button
              v-if="product.in_stock"
              @click="addToCart"
              :disabled="adding"
              class="btn btn-primary btn-rounded flex-1 py-2.5 px-6 disabled:opacity-50 gap-2"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              {{ adding ? 'Adding…' : 'Add to cart' }}
            </button>
            <button v-else disabled class="flex-1 bg-zinc-200 text-zinc-400 font-semibold py-2.5 px-6 rounded-md cursor-not-allowed">
              Sold out
            </button>

            <!-- Wishlist -->
            <button
              v-if="authStore.isAuthenticated"
              @click="toggleWishlist"
              :disabled="togglingWishlist"
              class="p-2.5 rounded-md border transition-colors disabled:opacity-50"
              :class="wishlistStore.isWishlisted(product.id) ? 'border-red-300 bg-red-50 text-red-500' : 'border-zinc-300 hover:bg-zinc-50 text-zinc-400'"
              aria-label="Toggle wishlist"
            >
              <svg class="w-5 h-5 transition-colors" :class="wishlistStore.isWishlisted(product.id) ? 'fill-red-500' : ''" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>

          <!-- SKU -->
          <p class="mt-5 text-xs text-zinc-400">SKU: {{ product.sku }}</p>

          <!-- Action feedback -->
          <transition name="fade">
            <div v-if="actionMsg" class="mt-4 flex items-center gap-2 text-sm font-medium" :class="actionIsError ? 'text-red-600' : 'text-green-600'">
              <svg v-if="!actionIsError" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              {{ actionMsg }}
            </div>
          </transition>
        </div>
      </div>

      <!-- Reviews -->
      <div id="reviews">
        <h2 class="text-xl font-bold text-zinc-900 mb-6">
          Reviews
          <span class="text-base font-normal text-zinc-400 ml-2">({{ product.reviews_count }})</span>
        </h2>

        <div v-if="!product.reviews?.length" class="py-10 text-center text-zinc-400 bg-zinc-50 rounded-xl border border-zinc-100">
          No reviews yet for this item.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="review in product.reviews"
            :key="review.id"
            class="bg-white rounded-xl border border-zinc-100 shadow-sm p-5"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-zinc-900">{{ review.user?.name || 'Customer' }}</p>
                <div class="flex items-center gap-1 mt-1">
                  <svg v-for="n in 5" :key="n" class="h-4 w-4" :class="n <= review.rating ? 'text-amber-400' : 'text-zinc-200'" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>
              <span class="text-xs text-zinc-400 flex-shrink-0">{{ formatDate(review.created_at) }}</span>
            </div>
            <p v-if="review.title" class="mt-3 text-sm font-medium text-zinc-900">{{ review.title }}</p>
            <p v-if="review.body" class="mt-1.5 text-sm text-zinc-600 leading-relaxed">{{ review.body }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="fixed bottom-6 right-6 bg-zinc-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        {{ toast }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios, { resolveImageUrl } from '../axios'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const product = ref(null)
const loading = ref(true)
const qty = ref(1)
const adding = ref(false)
const togglingWishlist = ref(false)
const actionMsg = ref(null)
const actionIsError = ref(false)
const toast = ref(null)
let msgTimer = null
let toastTimer = null

const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

const showToast = (msg) => {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 2500)
}

const showAction = (msg, isError = false) => {
  actionMsg.value = msg
  actionIsError.value = isError
  clearTimeout(msgTimer)
  msgTimer = setTimeout(() => (actionMsg.value = null), 3000)
}

const fetchProduct = async () => {
  loading.value = true
  try {
    const response = await axios.get(`/products/${route.params.slug}`)
    product.value = response.data.data
  } catch (e) {
    product.value = null
  } finally {
    loading.value = false
  }
}

const addToCart = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  adding.value = true
  try {
    await cartStore.addToCart(product.value.id, qty.value)
    showAction('Added to your cart!')
    showToast(`${product.value.name} × ${qty.value} added to cart`)
  } catch (e) {
    showAction(e.response?.data?.message || 'Failed to add to cart', true)
  } finally {
    adding.value = false
  }
}

const toggleWishlist = async () => {
  togglingWishlist.value = true
  try {
    const added = await wishlistStore.toggle(product.value.id)
    showToast(added ? 'Saved to wishlist' : 'Removed from wishlist')
  } catch (e) {
    showToast(e.message || 'Failed to update wishlist')
  } finally {
    togglingWishlist.value = false
  }
}

onMounted(fetchProduct)
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
