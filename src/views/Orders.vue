<template>
  <div>
    <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">My Orders</h1>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 p-6 rounded-md text-center text-red-700">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="text-center py-24">
      <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
      <p class="mt-1 text-sm text-gray-500">Once you place an order, it will appear here.</p>
      <router-link to="/" class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
        Start Shopping
      </router-link>
    </div>

    <!-- Order list -->
    <div v-else class="space-y-6">
      <div v-for="order in orders" :key="order.id" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Order header -->
        <div class="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 border-b border-gray-200">
          <div class="flex flex-wrap gap-6">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide">Order number</p>
              <p class="text-sm font-semibold text-gray-900 font-mono">{{ order.order_number }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide">Placed on</p>
              <p class="text-sm font-medium text-gray-900">{{ formatDate(order.created_at) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide">Total</p>
              <p class="text-sm font-bold text-gray-900">${{ order.total }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <!-- Order status badge -->
            <span :class="statusClass(order.status)" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize">
              <span :class="statusDot(order.status)" class="w-1.5 h-1.5 rounded-full mr-1.5"></span>
              {{ order.status }}
            </span>
            <!-- Payment status badge -->
            <span :class="paymentClass(order.payment_status)" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize">
              {{ order.payment_status }}
            </span>
          </div>
        </div>

        <!-- Order items -->
        <ul class="divide-y divide-gray-100">
          <li v-for="item in order.items" :key="item.id" class="flex items-center px-6 py-4 gap-4">
            <div class="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
              <img
                :src="item.product?.image || 'https://placehold.co/64x64?text=?'"
                :alt="item.product_name"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ item.product_name }}</p>
              <p class="text-sm text-gray-500">Qty: {{ item.quantity }} × ${{ item.unit_price }}</p>
            </div>
            <p class="text-sm font-semibold text-gray-900">${{ item.total }}</p>
          </li>
        </ul>

        <!-- Order footer -->
        <div class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <span>Shipped to: {{ order.shipping_address }}</span>
          <span>Payment: {{ order.payment_method?.toUpperCase() }}</span>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="meta && meta.last_page > 1" class="flex justify-center gap-2 pt-4">
        <button
          v-for="page in meta.last_page"
          :key="page"
          @click="fetchOrders(page)"
          :class="page === meta.current_page ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
          class="px-3 py-2 text-sm rounded-md"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '../axios'

const orders = ref([])
const loading = ref(true)
const error = ref(null)
const meta = ref(null)

const fetchOrders = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get('/orders', { params: { page } })
    orders.value = response.data.data
    meta.value = response.data.meta
  } catch (e) {
    error.value = 'Failed to load orders.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

const statusClass = (status) => {
  const map = {
    pending:    'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped:    'bg-indigo-100 text-indigo-800',
    delivered:  'bg-green-100 text-green-800',
    cancelled:  'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const statusDot = (status) => {
  const map = {
    pending:    'bg-yellow-400',
    processing: 'bg-blue-400',
    shipped:    'bg-indigo-400',
    delivered:  'bg-green-400',
    cancelled:  'bg-red-400',
  }
  return map[status] || 'bg-gray-400'
}

const paymentClass = (status) => {
  const map = {
    pending: 'bg-orange-100 text-orange-800',
    paid:    'bg-green-100 text-green-800',
    failed:  'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

onMounted(fetchOrders)
</script>
