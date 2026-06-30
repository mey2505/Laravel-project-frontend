<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-zinc-900">Our Menu</h1>
      <p class="mt-1 text-zinc-500">Fresh favorites, made to order</p>
    </div>

    <!-- Controls -->
    <div class="flex flex-col sm:flex-row gap-3 mb-5">
      <div class="relative flex-1">
        <input
          v-model="searchQuery"
          @input="debounceSearch"
          type="text"
          placeholder="Search the menu..."
          class="w-full border border-zinc-300 rounded-md pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <svg class="w-4 h-4 text-zinc-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <select
        v-model="sortOption"
        @change="fetchProducts()"
        class="border border-zinc-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        <option value="latest">Newest first</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
        <option value="name">Name A–Z</option>
      </select>

      <label class="flex items-center gap-2 text-sm text-zinc-600 px-3 py-2.5 border border-zinc-300 rounded-md cursor-pointer hover:bg-zinc-50 select-none">
        <input type="checkbox" v-model="onSaleOnly" @change="fetchProducts()" class="rounded text-amber-400 border-zinc-300 focus:ring-amber-400" />
        Sale only
      </label>
    </div>

    <!-- Category pills -->
    <div class="flex flex-wrap gap-2 mb-8">
      <button
        @click="selectCategory('')"
        :class="selectedCategory === '' ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
      >
        All
      </button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="selectCategory(cat.slug)"
        :class="selectedCategory === cat.slug ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-md p-5 text-center">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="products.length === 0" class="text-center py-24">
      <svg class="w-14 h-14 mx-auto text-zinc-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-zinc-400">Nothing found for your search.</p>
      <button @click="resetFilters" class="mt-4 text-sm font-medium text-amber-600 hover:text-amber-700">Clear filters</button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-zinc-100 flex flex-col"
      >
        <!-- Image -->
        <router-link :to="{ name: 'ProductDetails', params: { slug: product.slug } }" class="block relative w-full h-48 bg-zinc-100 overflow-hidden">
          <img
            :src="resolveImageUrl(product.image) || 'https://placehold.co/400x300?text=No+Image'"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span v-if="!product.in_stock" class="absolute top-2 left-2 bg-zinc-900/90 text-white text-xs font-semibold px-2 py-1 rounded">Sold out</span>
          <span v-if="product.discount_price" class="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">Sale</span>
        </router-link>

        <!-- Wishlist toggle -->
        <button
          v-if="authStore.isAuthenticated"
          @click.prevent="toggleWishlist(product)"
          :disabled="togglingId === product.id"
          class="absolute top-2 right-2 mt-7 p-1.5 rounded-full bg-white/90 shadow transition-colors hover:bg-white"
          :class="{ 'opacity-50': togglingId === product.id }"
          :aria-label="wishlistStore.isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
        >
          <svg class="w-4 h-4 transition-colors" :class="wishlistStore.isWishlisted(product.id) ? 'text-red-500 fill-red-500' : 'text-zinc-400'" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <!-- Info -->
        <div class="p-4 flex flex-col flex-grow">
          <p class="text-xs text-amber-600 font-medium mb-1">{{ product.category?.name }}</p>
          <router-link :to="{ name: 'ProductDetails', params: { slug: product.slug } }">
            <h3 class="text-sm font-semibold text-zinc-900 hover:text-amber-600 transition-colors line-clamp-2 flex-grow">{{ product.name }}</h3>
          </router-link>

          <div v-if="product.reviews_count > 0" class="flex items-center mt-1.5 gap-1">
            <svg v-for="n in 5" :key="n" class="h-3.5 w-3.5" :class="n <= Math.round(product.reviews_avg) ? 'text-amber-400' : 'text-zinc-200'" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="text-xs text-zinc-400">({{ product.reviews_count }})</span>
          </div>

          <div class="mt-2 flex items-end justify-between gap-2">
            <div>
              <span class="text-base font-bold text-zinc-900">${{ product.discount_price ?? product.price }}</span>
              <span v-if="product.discount_price" class="ml-1.5 text-xs text-zinc-400 line-through">${{ product.price }}</span>
            </div>

            <button
              v-if="product.in_stock"
              @click="addToCart(product)"
              :disabled="addingId === product.id"
              class="flex-shrink-0 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
            >
              <span v-if="addingId === product.id">Adding…</span>
              <span v-else>Add</span>
            </button>
            <span v-else class="text-xs text-zinc-400">Out of stock</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.last_page > 1" class="mt-10 flex justify-center gap-2">
      <button
        v-for="page in pagination.last_page"
        :key="page"
        @click="fetchProducts(page)"
        :class="page === pagination.current_page ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50'"
        class="px-3 py-2 text-sm rounded-md transition-colors"
      >
        {{ page }}
      </button>
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
import { useRouter } from 'vue-router'
import axios, { resolveImageUrl } from '../axios'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const products = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const selectedCategory = ref('')
const sortOption = ref('latest')
const onSaleOnly = ref(false)
const pagination = ref(null)
const addingId = ref(null)
const togglingId = ref(null)
const toast = ref(null)

let searchTimer = null
let toastTimer = null

const showToast = (msg) => {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 2500)
}

const fetchProducts = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get('/products', {
      params: {
        page,
        search: searchQuery.value || undefined,
        category: selectedCategory.value || undefined,
        sort: sortOption.value,
        on_sale: onSaleOnly.value ? 1 : undefined,
      },
    })
    products.value = response.data.data
    pagination.value = response.data.meta
  } catch (e) {
    error.value = 'Failed to load menu. Please check the backend is running.'
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await axios.get('/categories')
    categories.value = response.data.data || response.data
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
}

const debounceSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchProducts(), 400)
}

const selectCategory = (slug) => {
  selectedCategory.value = slug
  fetchProducts()
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  sortOption.value = 'latest'
  onSaleOnly.value = false
  fetchProducts()
}

const addToCart = async (product) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
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

const toggleWishlist = async (product) => {
  togglingId.value = product.id
  try {
    const added = await wishlistStore.toggle(product.id)
    showToast(added ? `${product.name} saved to wishlist` : `${product.name} removed from wishlist`)
  } catch (e) {
    showToast(e.message || 'Failed to update wishlist')
  } finally {
    togglingId.value = null
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
