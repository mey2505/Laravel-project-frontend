<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <input
            v-model="search"
            @input="debounceFetch"
            type="text"
            placeholder="Search order # or customer..."
            class="w-64 border border-zinc-300 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <svg class="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <select
          v-model="statusFilter"
          @change="fetchOrders"
          class="border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All statuses</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ capitalize(s) }}</option>
        </select>
      </div>

      <div class="text-sm text-zinc-500">
        {{ meta.total ?? orders.length }} order{{ (meta.total ?? orders.length) === 1 ? '' : 's' }}
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
    </div>

    <div v-else class="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-zinc-50 text-zinc-500 text-left">
          <tr>
            <th class="px-5 py-3 font-medium">Order #</th>
            <th class="px-5 py-3 font-medium">Customer</th>
            <th class="px-5 py-3 font-medium">Items</th>
            <th class="px-5 py-3 font-medium">Total</th>
            <th class="px-5 py-3 font-medium">Payment</th>
            <th class="px-5 py-3 font-medium">Status</th>
            <th class="px-5 py-3 font-medium">Date</th>
            <th class="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-zinc-50/60">
            <td class="px-5 py-3 font-medium text-zinc-900">{{ order.order_number }}</td>
            <td class="px-5 py-3 text-zinc-700">
              <div>{{ order.customer?.name || '—' }}</div>
              <div class="text-xs text-zinc-400">{{ order.customer?.email }}</div>
            </td>
            <td class="px-5 py-3 text-zinc-600">{{ order.items_count }}</td>
            <td class="px-5 py-3 font-medium text-zinc-900">${{ Number(order.total).toFixed(2) }}</td>
            <td class="px-5 py-3">
              <span :class="paymentBadgeClass(order.payment_status)" class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                {{ order.payment_status }}
              </span>
            </td>
            <td class="px-5 py-3">
              <select
                :value="order.status"
                @change="updateStatus(order, $event.target.value)"
                :disabled="updatingId === order.id"
                class="text-xs font-medium rounded-md px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                :class="statusBadgeClass(order.status)"
              >
                <option v-for="s in statuses" :key="s" :value="s">{{ capitalize(s) }}</option>
              </select>
            </td>
            <td class="px-5 py-3 text-zinc-500">{{ formatDate(order.created_at) }}</td>
            <td class="px-5 py-3 text-right">
              <router-link :to="{ name: 'AdminOrderDetails', params: { id: order.id } }" class="text-amber-600 hover:text-amber-700 font-medium">
                View
              </router-link>
            </td>
          </tr>
          <tr v-if="!orders.length">
            <td colspan="8" class="px-5 py-12 text-center text-zinc-400">No orders found.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="meta.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-zinc-100">
        <button
          :disabled="meta.current_page <= 1"
          @click="goToPage(meta.current_page - 1)"
          class="px-3 py-1.5 text-sm font-medium text-zinc-600 rounded-md hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span class="text-sm text-zinc-500">Page {{ meta.current_page }} of {{ meta.last_page }}</span>
        <button
          :disabled="meta.current_page >= meta.last_page"
          @click="goToPage(meta.current_page + 1)"
          class="px-3 py-1.5 text-sm font-medium text-zinc-600 rounded-md hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from '../../axios'

const orders = ref([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')
const updatingId = ref(null)
const meta = reactive({ current_page: 1, last_page: 1, total: 0 })

const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled']

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

const formatDate = (date) => new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

const statusBadgeClass = (status) => ({
  pending: 'bg-zinc-100 text-zinc-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}[status] || 'bg-zinc-100 text-zinc-700')

const paymentBadgeClass = (status) => ({
  pending: 'bg-zinc-100 text-zinc-600',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-amber-100 text-amber-700',
}[status] || 'bg-zinc-100 text-zinc-600')

let searchTimer = null
const debounceFetch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchOrders(1), 400)
}

const fetchOrders = async (page = 1) => {
  loading.value = true
  try {
    const response = await axios.get('/admin/orders', {
      params: {
        page,
        search: search.value || undefined,
        status: statusFilter.value || undefined,
      },
    })
    orders.value = response.data.data
    const m = response.data.meta
    if (m) {
      meta.current_page = m.current_page
      meta.last_page = m.last_page
      meta.total = m.total
    }
  } catch (e) {
    console.error('Failed to load orders:', e)
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  if (page < 1 || page > meta.last_page) return
  fetchOrders(page)
}

const updateStatus = async (order, newStatus) => {
  if (newStatus === order.status) return
  updatingId.value = order.id
  const previous = order.status
  order.status = newStatus
  try {
    await axios.put(`/admin/orders/${order.id}/status`, { status: newStatus })
  } catch (e) {
    order.status = previous
    alert(e.response?.data?.message || 'Failed to update order status.')
  } finally {
    updatingId.value = null
  }
}

onMounted(() => fetchOrders())
</script>
