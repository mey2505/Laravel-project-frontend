<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-zinc-50">
    <h1 class="text-3xl font-bold text-zinc-900 mb-8">My Orders</h1>

    <div v-if="loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-md p-5 text-center">{{ error }}</div>

    <div v-else-if="orders.length === 0" class="text-center py-24">
      <svg class="mx-auto h-14 w-14 text-zinc-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="text-lg font-semibold text-zinc-900">No orders yet</h3>
      <p class="mt-1 text-sm text-zinc-500">Once you place an order, it will appear here.</p>
      <router-link to="/menu" class="btn btn-primary btn-rounded px-6 py-2.5 mt-6">Browse the menu</router-link>
    </div>

    <div v-else class="space-y-6">
      <div v-for="order in orders" :key="order.id" class="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div class="px-6 py-5 sm:px-8 sm:py-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-3">
              <div class="grid gap-4 sm:grid-cols-3">
                <div>
                  <p class="text-xs text-zinc-400 uppercase tracking-wide mb-1">Order</p>
                  <p class="text-sm font-semibold text-zinc-900">{{ order.order_number }}</p>
                </div>
                <div>
                  <p class="text-xs text-zinc-400 uppercase tracking-wide mb-1">Placed</p>
                  <p class="text-sm font-medium text-zinc-700">{{ formatDate(order.created_at) }}</p>
                </div>
                <div>
                  <p class="text-xs text-zinc-400 uppercase tracking-wide mb-1">Total</p>
                  <p class="text-sm font-bold text-zinc-900">${{ Number(order.total).toFixed(2) }}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <span :class="statusClass(order.status)" class="px-3 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1.5">
                  <span :class="statusDot(order.status)" class="w-2 h-2 rounded-full"></span>
                  {{ order.status }}
                </span>
                <span :class="paymentClass(order.payment_status)" class="px-3 py-1 rounded-full text-xs font-semibold capitalize">
                  {{ order.payment_status }}
                </span>
              </div>
            </div>
            <div class="text-sm text-zinc-500 space-y-1 bg-zinc-100 rounded-2xl p-4 border border-zinc-200">
              <p class="font-semibold text-zinc-900">Shipping</p>
              <p>{{ order.shipping_address }}</p>
              <p class="capitalize">{{ (order.payment_method || '').replace('_', ' ') }}</p>
            </div>
          </div>
        </div>

        <!-- Items -->
        <ul class="divide-y divide-zinc-100 bg-zinc-50">
          <li v-for="item in order.items" :key="item.id" class="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center">
            <div class="flex items-center gap-4">
              <div class="flex-shrink-0 h-16 w-16 rounded-3xl bg-zinc-100 overflow-hidden border border-zinc-200 shadow-sm">
                <img
                  :src="item.product?.image ? resolveImageUrl(item.product.image) : 'https://placehold.co/64x64?text=?'"
                  :alt="item.product_name"
                  class="h-full w-full object-cover"
                />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-zinc-900 truncate">{{ item.product_name }}</p>
                <p class="text-sm text-zinc-500">Qty {{ item.quantity }} · ${{ Number(item.unit_price).toFixed(2) }} each</p>
              </div>
            </div>
            <p class="text-sm font-semibold text-zinc-900 ml-auto">${{ Number(item.total).toFixed(2) }}</p>
          </li>
        </ul>
      </div>
    </div>

      <!-- Pagination -->
      <div v-if="meta && meta.last_page > 1" class="flex justify-center gap-2 pt-4">
        <button
          v-for="page in meta.last_page"
          :key="page"
          @click="fetchOrders(page)"
          :class="page === meta.current_page ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50'"
          class="px-3 py-2 text-sm rounded-md transition-colors"
        >
          {{ page }}
        </button>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios, { resolveImageUrl } from '../axios'

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
  } finally {
    loading.value = false
  }
}

const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

const statusClass = (s) => ({
  pending: 'bg-zinc-100 text-zinc-700', processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}[s] || 'bg-zinc-100 text-zinc-700')

const statusDot = (s) => ({
  pending: 'bg-zinc-400', processing: 'bg-blue-400', shipped: 'bg-purple-400',
  completed: 'bg-green-400', cancelled: 'bg-red-400',
}[s] || 'bg-zinc-400')

const paymentClass = (s) => ({
  pending: 'bg-zinc-100 text-zinc-600', paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700', refunded: 'bg-amber-100 text-amber-700',
}[s] || 'bg-zinc-100 text-zinc-600')

onMounted(fetchOrders)
</script>
