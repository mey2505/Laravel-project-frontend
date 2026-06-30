<template>
  <div class="min-h-screen bg-zinc-100 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-zinc-950 text-zinc-300 flex flex-col fixed inset-y-0">
      <div class="px-6 py-5 border-b border-zinc-800">
        <router-link to="/admin" class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 font-bold">B</span>
          <span class="font-bold text-white text-lg">Bite Admin</span>
        </router-link>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="isActive(item.name) ? 'bg-amber-500 text-zinc-950' : 'hover:bg-zinc-800 hover:text-white'"
        >
          <span v-html="item.icon" class="w-5 h-5 flex-shrink-0"></span>
          {{ item.label }}
        </router-link>
      </nav>

      <div class="px-3 py-4 border-t border-zinc-800">
        <router-link
          to="/"
          target="_blank"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          View storefront
        </router-link>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 ml-64">
      <header class="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 class="text-lg font-semibold text-zinc-900">{{ pageTitle }}</h1>
        <div class="flex items-center gap-3 text-sm text-zinc-600">
          <span>{{ authStore.user?.name }}</span>
          <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">{{ primaryRole }}</span>
        </div>
      </header>
      <main class="p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { name: 'AdminDashboard', label: 'Dashboard', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>' },
  { name: 'AdminOrders', label: 'Orders', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>' },
  { name: 'AdminCustomers', label: 'Customers', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" /></svg>' },
  { name: 'AdminCategories', label: 'Categories', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>' },
  { name: 'AdminProducts', label: 'Products', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>' },
  { name: 'AdminSettings', label: 'Homepage & Settings', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>' },
]

const pageTitle = computed(() => {
  if (route.name === 'AdminOrderDetails') return 'Order Details'
  if (route.name === 'AdminCustomerDetails') return 'Customer Details'
  return navItems.find(i => i.name === route.name)?.label || 'Admin'
})
const primaryRole = computed(() => authStore.user?.roles?.[0] || 'Admin')

const isActive = (name) => {
  if (route.name === name) return true
  if (name === 'AdminOrders' && route.name === 'AdminOrderDetails') return true
  if (name === 'AdminCustomers' && route.name === 'AdminCustomerDetails') return true
  return false
}

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'AdminLogin' })
}
</script>
