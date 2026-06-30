<template>
  <div>
    <div v-if="loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 p-6 rounded-lg text-red-700">
      {{ error }}
    </div>

    <div v-else>
      <!-- Stat cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div class="bg-white rounded-xl border border-zinc-200 p-5">
          <p class="text-sm text-zinc-500">Total Products</p>
          <p class="text-2xl font-bold text-zinc-900 mt-1">{{ stats.products_count }}</p>
        </div>
        <div class="bg-white rounded-xl border border-zinc-200 p-5">
          <p class="text-sm text-zinc-500">Categories</p>
          <p class="text-2xl font-bold text-zinc-900 mt-1">{{ stats.categories_count }}</p>
        </div>
        <div class="bg-white rounded-xl border border-zinc-200 p-5">
          <p class="text-sm text-zinc-500">Orders</p>
          <p class="text-2xl font-bold text-zinc-900 mt-1">{{ stats.orders_count }}</p>
        </div>
        <div class="bg-white rounded-xl border border-zinc-200 p-5">
          <p class="text-sm text-zinc-500">Revenue (paid)</p>
          <p class="text-2xl font-bold text-zinc-900 mt-1">${{ stats.revenue_total?.toFixed(2) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div class="bg-white rounded-xl border border-zinc-200 p-5">
          <p class="text-sm text-zinc-500">Customers</p>
          <p class="text-2xl font-bold text-zinc-900 mt-1">{{ stats.customers_count }}</p>
        </div>
        <div class="bg-white rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p class="text-sm text-amber-700">Low stock items (&le;5)</p>
          <p class="text-2xl font-bold text-amber-800 mt-1">{{ stats.low_stock_count }}</p>
        </div>
      </div>

      <!-- Quick links -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <router-link :to="{ name: 'AdminCategories' }" class="bg-white rounded-xl border border-zinc-200 p-5 hover:border-amber-400 hover:shadow-sm transition">
          <p class="font-semibold text-zinc-900">Manage Categories</p>
          <p class="text-sm text-zinc-500 mt-1">Burgers, Pizza, Drinks, and more</p>
        </router-link>
        <router-link :to="{ name: 'AdminProducts' }" class="bg-white rounded-xl border border-zinc-200 p-5 hover:border-amber-400 hover:shadow-sm transition">
          <p class="font-semibold text-zinc-900">Manage Products</p>
          <p class="text-sm text-zinc-500 mt-1">Add or edit menu items and photos</p>
        </router-link>
        <router-link :to="{ name: 'AdminSettings' }" class="bg-white rounded-xl border border-zinc-200 p-5 hover:border-amber-400 hover:shadow-sm transition">
          <p class="font-semibold text-zinc-900">Homepage & Settings</p>
          <p class="text-sm text-zinc-500 mt-1">Edit the hero banner customers see</p>
        </router-link>
      </div>

      <!-- Recent orders -->
      <div class="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div class="px-5 py-4 border-b border-zinc-200">
          <h2 class="font-semibold text-zinc-900">Recent Orders</h2>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-zinc-50 text-zinc-500 text-left">
            <tr>
              <th class="px-5 py-2.5 font-medium">Order #</th>
              <th class="px-5 py-2.5 font-medium">Customer</th>
              <th class="px-5 py-2.5 font-medium">Status</th>
              <th class="px-5 py-2.5 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr v-for="order in stats.recent_orders" :key="order.id">
              <td class="px-5 py-3 font-medium text-zinc-900">{{ order.order_number }}</td>
              <td class="px-5 py-3 text-zinc-600">{{ order.user?.name || 'Guest' }}</td>
              <td class="px-5 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">{{ order.status }}</span>
              </td>
              <td class="px-5 py-3 text-right text-zinc-900">${{ Number(order.total).toFixed(2) }}</td>
            </tr>
            <tr v-if="!stats.recent_orders?.length">
              <td colspan="4" class="px-5 py-8 text-center text-zinc-400">No orders yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '../../axios'

const stats = ref({})
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const response = await axios.get('/admin/dashboard')
    stats.value = response.data.data
  } catch (e) {
    error.value = 'Failed to load dashboard data.'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
