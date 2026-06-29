<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">Our Products</h1>
      <p class="mt-1 text-sm text-gray-500">Browse our latest collection</p>
    </div>

    <!-- Search & Filter bar -->
    <div class="flex flex-col sm:flex-row gap-3 mb-8">
      <input
        v-model="searchQuery"
        @input="debounceSearch"
        type="text"
        placeholder="Search products..."
        class="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <select
        v-model="selectedCategory"
        @change="fetchProducts"
        class="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 p-6 rounded-md text-center">
      <p class="text-red-700">{{ error }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="products.length === 0" class="text-center py-24 text-gray-500">
      No products found.
    </div>

    <!-- Product Grid -->
    <div v-else class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      <router-link
        v-for="product in products"
        :key="product.id"
        :to="{ name: 'ProductDetails', params: { slug: product.slug } }"
        class="group flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        <!-- Image -->
        <div class="relative w-full h-56 bg-gray-100 overflow-hidden">
          <img
            :src="product.image || 'https://placehold.co/400x300?text=No+Image'"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span v-if="!product.in_stock" class="absolute top-2 left-2 bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded">Out of stock</span>
          <span v-if="product.discount_price" class="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">Sale</span>
        </div>

        <!-- Info -->
        <div class="p-4 flex flex-col flex-grow">
          <p class="text-xs text-indigo-600 font-medium mb-1">{{ product.category?.name }}</p>
          <h3 class="text-sm font-semibold text-gray-900 line-clamp-2 flex-grow">{{ product.name }}</h3>

          <!-- Rating -->
          <div v-if="product.reviews_count > 0" class="flex items-center mt-1 gap-1">
            <svg v-for="n in 5" :key="n" class="h-3.5 w-3.5" :class="n <= Math.round(product.reviews_avg) ? 'text-yellow-400' : 'text-gray-200'" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="text-xs text-gray-500">({{ product.reviews_count }})</span>
          </div>

          <!-- Price -->
          <div class="mt-2 flex items-center gap-2">
            <span class="text-base font-bold text-gray-900">${{ product.discount_price ?? product.price }}</span>
            <span v-if="product.discount_price" class="text-sm text-gray-400 line-through">${{ product.price }}</span>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.last_page > 1" class="mt-10 flex justify-center gap-2">
      <button
        v-for="page in pagination.last_page"
        :key="page"
        @click="goToPage(page)"
        :class="page === pagination.current_page ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
        class="px-3 py-2 text-sm rounded-md"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '../axios'

const products = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const selectedCategory = ref('')
const pagination = ref(null)

let searchTimer = null

const fetchProducts = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const params = { page }
    if (searchQuery.value) params.search = searchQuery.value
    if (selectedCategory.value) params.category = selectedCategory.value

    const response = await axios.get('/products', { params })
    products.value = response.data.data
    pagination.value = response.data.meta
  } catch (e) {
    error.value = 'Failed to load products. Ensure the backend API is running.'
    console.error(e)
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
  searchTimer = setTimeout(fetchProducts, 400)
}

const goToPage = (page) => fetchProducts(page)

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>

