<template>
  <div>
    <router-link :to="{ name: 'AdminCustomers' }" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 mb-5">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      Back to customers
    </router-link>

    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
    </div>

    <div v-else-if="!customer" class="text-center py-16 text-zinc-400">Customer not found.</div>

    <div v-else class="space-y-6">
      <!-- Profile header -->
      <div class="bg-white rounded-xl border border-zinc-200 p-6 flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-semibold flex-shrink-0">
          {{ initials(customer.name) }}
        </div>
        <div>
          <h2 class="text-lg font-semibold text-zinc-900">{{ customer.name }}</h2>
          <p class="text-sm text-zinc-500">{{ customer.email }}</p>
        </div>
        <div class="ml-auto flex gap-6 text-right">
          <div>
            <p class="text-xs text-zinc-400 uppercase tracking-wide">Orders</p>
            <p class="text-xl font-semibold text-zinc-900">{{ customer.orders_count }}</p>
          </div>
          <div>
            <p class="text-xs text-zinc-400 uppercase tracking-wide">Total spent</p>
            <p class="text-xl font-semibold text-zinc-900">${{ Number(customer.total_spent).toFixed(2) }}</p>
          </div>
          <div>
            <p class="text-xs text-zinc-400 uppercase tracking-wide">Joined</p>
            <p class="text-sm font-medium text-zinc-700 mt-1.5">{{ formatDate(customer.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Order history -->
      <div class="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-100">
          <h3 class="font-semibold text-zinc-900">Order history</h3>
        </div>

        <div v-if="!customer.orders?.length" class="px-6 py-12 text-center text-zinc-400">
          This customer hasn't placed any orders yet.
        </div>

        <table v-else class="w-full text-sm">
          <thead class="bg-zinc-50 text-zinc-500 text-left">
            <tr>
              <th class="px-6 py-3 font-medium">Order #</th>
              <th class="px-6 py-3 font-medium">Items</th>
              <th class="px-6 py-3 font-medium">Total</th>
              <th class="px-6 py-3 font-medium">Payment</th>
              <th class="px-6 py-3 font-medium">Status</th>
              <th class="px-6 py-3 font-medium">Date</th>
              <th class="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr v-for="order in customer.orders" :key="order.id" class="hover:bg-zinc-50/60">
              <td class="px-6 py-3 font-medium text-zinc-900">{{ order.order_number }}</td>
              <td class="px-6 py-3 text-zinc-600">{{ order.items?.length || 0 }}</td>
              <td class="px-6 py-3 font-medium text-zinc-900">${{ Number(order.total).toFixed(2) }}</td>
              <td class="px-6 py-3">
                <span :class="paymentBadgeClass(order.payment_status)" class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">{{ order.payment_status }}</span>
              </td>
              <td class="px-6 py-3">
                <span :class="statusBadgeClass(order.status)" class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">{{ order.status }}</span>
              </td>
              <td class="px-6 py-3 text-zinc-500">{{ formatDate(order.created_at) }}</td>
              <td class="px-6 py-3 text-right">
                <router-link :to="{ name: 'AdminOrderDetails', params: { id: order.id } }" class="text-amber-600 hover:text-amber-700 font-medium">
                  View
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '../../axios'

const route = useRoute()
const customer = ref(null)
const loading = ref(true)

const initials = (name) => (name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
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

const fetchCustomer = async () => {
  loading.value = true
  try {
    const response = await axios.get(`/admin/customers/${route.params.id}`)
    customer.value = response.data.data
  } catch (e) {
    console.error('Failed to load customer:', e)
    customer.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchCustomer)
</script>
