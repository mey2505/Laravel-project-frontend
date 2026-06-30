<template>
  <div>
    <router-link :to="{ name: 'AdminOrders' }" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 mb-5">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      Back to orders
    </router-link>

    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
    </div>

    <div v-else-if="!order" class="text-center py-16 text-zinc-400">Order not found.</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: items + summary -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl border border-zinc-200 p-6">
          <div class="flex items-start justify-between mb-1">
            <h2 class="text-xl font-semibold text-zinc-900">{{ order.order_number }}</h2>
            <span :class="statusBadgeClass(order.status)" class="px-2.5 py-1 rounded-full text-xs font-medium capitalize">{{ order.status }}</span>
          </div>
          <p class="text-sm text-zinc-500">Placed on {{ formatDate(order.created_at) }}</p>
        </div>

        <div class="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-zinc-100">
            <h3 class="font-semibold text-zinc-900">Items</h3>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-zinc-50 text-zinc-500 text-left">
              <tr>
                <th class="px-6 py-3 font-medium">Product</th>
                <th class="px-6 py-3 font-medium">Unit Price</th>
                <th class="px-6 py-3 font-medium">Qty</th>
                <th class="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              <tr v-for="item in order.items" :key="item.id">
                <td class="px-6 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="item.product?.image"
                      :src="resolveImageUrl(item.product.image)"
                      class="w-10 h-10 rounded-md object-cover bg-zinc-100"
                    />
                    <div class="w-10 h-10 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-400" v-else>
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <span class="font-medium text-zinc-900">{{ item.product_name }}</span>
                  </div>
                </td>
                <td class="px-6 py-3 text-zinc-600">${{ Number(item.unit_price).toFixed(2) }}</td>
                <td class="px-6 py-3 text-zinc-600">{{ item.quantity }}</td>
                <td class="px-6 py-3 text-right font-medium text-zinc-900">${{ Number(item.total).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="px-6 py-4 border-t border-zinc-100 space-y-1.5 text-sm max-w-xs ml-auto">
            <div class="flex justify-between text-zinc-500"><span>Subtotal</span><span>${{ Number(order.subtotal).toFixed(2) }}</span></div>
            <div class="flex justify-between text-zinc-500"><span>Tax</span><span>${{ Number(order.tax).toFixed(2) }}</span></div>
            <div class="flex justify-between text-zinc-500"><span>Shipping</span><span>${{ Number(order.shipping_fee).toFixed(2) }}</span></div>
            <div class="flex justify-between text-base font-semibold text-zinc-900 pt-1.5 border-t border-zinc-100"><span>Total</span><span>${{ Number(order.total).toFixed(2) }}</span></div>
          </div>
        </div>

        <div v-if="order.notes" class="bg-white rounded-xl border border-zinc-200 p-6">
          <h3 class="font-semibold text-zinc-900 mb-2">Notes</h3>
          <p class="text-sm text-zinc-600">{{ order.notes }}</p>
        </div>
      </div>

      <!-- Right: customer + status controls -->
      <div class="space-y-6">
        <div class="bg-white rounded-xl border border-zinc-200 p-6">
          <h3 class="font-semibold text-zinc-900 mb-4">Customer</h3>
          <div v-if="order.customer" class="space-y-1 text-sm">
            <p class="font-medium text-zinc-900">{{ order.customer.name }}</p>
            <p class="text-zinc-500">{{ order.customer.email }}</p>
          </div>
          <p v-else class="text-sm text-zinc-400">Guest checkout</p>

          <div v-if="order.shipping_address" class="mt-4 pt-4 border-t border-zinc-100">
            <p class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Shipping address</p>
            <p class="text-sm text-zinc-600">{{ order.shipping_address }}</p>
          </div>

          <router-link
            v-if="order.customer"
            :to="{ name: 'AdminCustomerDetails', params: { id: order.customer.id } }"
            class="inline-block mt-4 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            View customer profile →
          </router-link>
        </div>

        <div class="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
          <h3 class="font-semibold text-zinc-900">Manage order</h3>

          <div>
            <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Order status</label>
            <select
              v-model="statusForm"
              @change="updateField('status', statusForm)"
              :disabled="saving"
              class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            >
              <option v-for="s in statuses" :key="s" :value="s">{{ capitalize(s) }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Payment status</label>
            <select
              v-model="paymentForm"
              @change="updateField('payment_status', paymentForm)"
              :disabled="saving"
              class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            >
              <option v-for="s in paymentStatuses" :key="s" :value="s">{{ capitalize(s) }}</option>
            </select>
          </div>

          <p v-if="saved" class="text-xs text-green-600">Saved.</p>
          <p v-if="error" class="text-xs text-red-600">{{ error }}</p>

          <div class="pt-2 border-t border-zinc-100">
            <p class="text-xs text-zinc-500">Payment method</p>
            <p class="text-sm font-medium text-zinc-900 capitalize">{{ (order.payment_method || '—').replace('_', ' ') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios, { resolveImageUrl } from '../../axios'

const route = useRoute()
const order = ref(null)
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const error = ref(null)
const statusForm = ref('')
const paymentForm = ref('')

const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled']
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded']

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
const formatDate = (date) => new Date(date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

const statusBadgeClass = (status) => ({
  pending: 'bg-zinc-100 text-zinc-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}[status] || 'bg-zinc-100 text-zinc-700')

const fetchOrder = async () => {
  loading.value = true
  try {
    const response = await axios.get(`/admin/orders/${route.params.id}`)
    order.value = response.data.data
    statusForm.value = order.value.status
    paymentForm.value = order.value.payment_status
  } catch (e) {
    console.error('Failed to load order:', e)
    order.value = null
  } finally {
    loading.value = false
  }
}

const updateField = async (field, value) => {
  saving.value = true
  saved.value = false
  error.value = null
  try {
    const endpoint = field === 'status' ? 'status' : 'payment-status'
    const response = await axios.put(`/admin/orders/${route.params.id}/${endpoint}`, { [field]: value })
    order.value = response.data.data
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to update order.'
  } finally {
    saving.value = false
  }
}

onMounted(fetchOrder)
</script>
