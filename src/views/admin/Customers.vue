<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div class="relative">
        <input
          v-model="search"
          @input="debounceFetch"
          type="text"
          placeholder="Search by name or email..."
          class="w-72 border border-zinc-300 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <svg class="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>
      <div class="text-sm text-zinc-500">
        {{ meta.total ?? customers.length }} customer{{ (meta.total ?? customers.length) === 1 ? '' : 's' }}
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
    </div>

    <div v-else class="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-zinc-50 text-zinc-500 text-left">
          <tr>
            <th class="px-5 py-3 font-medium">Customer</th>
            <th class="px-5 py-3 font-medium">Email</th>
            <th class="px-5 py-3 font-medium">Orders</th>
            <th class="px-5 py-3 font-medium">Total Spent</th>
            <th class="px-5 py-3 font-medium">Joined</th>
            <th class="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="customer in customers" :key="customer.id" class="hover:bg-zinc-50/60">
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {{ initials(customer.name) }}
                </div>
                <span class="font-medium text-zinc-900">{{ customer.name }}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-zinc-600">{{ customer.email }}</td>
            <td class="px-5 py-3 text-zinc-600">{{ customer.orders_count }}</td>
            <td class="px-5 py-3 font-medium text-zinc-900">${{ Number(customer.total_spent).toFixed(2) }}</td>
            <td class="px-5 py-3 text-zinc-500">{{ formatDate(customer.created_at) }}</td>
            <td class="px-5 py-3 text-right">
              <router-link :to="{ name: 'AdminCustomerDetails', params: { id: customer.id } }" class="text-amber-600 hover:text-amber-700 font-medium">
                View
              </router-link>
            </td>
          </tr>
          <tr v-if="!customers.length">
            <td colspan="6" class="px-5 py-12 text-center text-zinc-400">No customers found.</td>
          </tr>
        </tbody>
      </table>

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

const customers = ref([])
const loading = ref(true)
const search = ref('')
const meta = reactive({ current_page: 1, last_page: 1, total: 0 })

const initials = (name) => (name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
const formatDate = (date) => new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

let searchTimer = null
const debounceFetch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchCustomers(1), 400)
}

const fetchCustomers = async (page = 1) => {
  loading.value = true
  try {
    const response = await axios.get('/admin/customers', {
      params: { page, search: search.value || undefined },
    })
    customers.value = response.data.data
    const m = response.data.meta
    if (m) {
      meta.current_page = m.current_page
      meta.last_page = m.last_page
      meta.total = m.total
    }
  } catch (e) {
    console.error('Failed to load customers:', e)
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  if (page < 1 || page > meta.last_page) return
  fetchCustomers(page)
}

onMounted(() => fetchCustomers())
</script>
