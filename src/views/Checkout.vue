<template>
  <div class="bg-white">
    <div class="max-w-2xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:max-w-7xl lg:px-8">

      <!-- Order Success -->
      <div v-if="orderPlaced" class="text-center py-20">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Order Confirmed!</h2>
        <p class="mt-2 text-lg text-gray-500">Thank you for your order. You'll receive a confirmation email shortly.</p>
        <p class="mt-1 text-sm text-gray-500">Order #{{ placedOrderNumber }}</p>
      <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <router-link to="/orders" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            View My Orders
          </router-link>
          <router-link to="/" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Continue Shopping
          </router-link>
        </div>
      </div>

      <!-- Checkout Form -->
      <template v-else>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Checkout</h1>

        <div v-if="!authStore.isAuthenticated" class="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p class="text-sm text-yellow-800">
            Please <router-link to="/login" class="font-medium underline">sign in</router-link> to complete your order.
          </p>
        </div>

        <form v-else class="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16" @submit.prevent="placeOrder">

          <!-- Shipping Info -->
          <div class="lg:col-span-7">
            <h2 class="text-lg font-medium text-gray-900">Shipping information</h2>

            <div v-if="error" class="mt-4 bg-red-50 p-4 rounded-md text-red-700 text-sm">{{ error }}</div>

            <div class="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div class="sm:col-span-2">
                <label for="full-name" class="block text-sm font-medium text-gray-700">Full name</label>
                <div class="mt-1">
                  <input type="text" id="full-name" v-model="form.shipping_name" required class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                </div>
              </div>

              <div class="sm:col-span-2">
                <label for="address" class="block text-sm font-medium text-gray-700">Street address</label>
                <div class="mt-1">
                  <input type="text" id="address" v-model="form.shipping_address" required class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                </div>
              </div>

              <div>
                <label for="city" class="block text-sm font-medium text-gray-700">City</label>
                <div class="mt-1">
                  <input type="text" id="city" v-model="form.shipping_city" required class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                </div>
              </div>

              <div>
                <label for="postal-code" class="block text-sm font-medium text-gray-700">Postal code</label>
                <div class="mt-1">
                  <input type="text" id="postal-code" v-model="form.shipping_postal_code" required class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                </div>
              </div>

              <div class="sm:col-span-2">
                <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
                <div class="mt-1">
                  <input type="tel" id="phone" v-model="form.shipping_phone" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                </div>
              </div>

              <div class="sm:col-span-2">
                <label for="notes" class="block text-sm font-medium text-gray-700">Order notes (optional)</label>
                <div class="mt-1">
                  <textarea id="notes" v-model="form.notes" rows="3" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"></textarea>
                </div>
              </div>
            </div>

            <div class="mt-10 border-t border-gray-200 pt-10">
              <h2 class="text-lg font-medium text-gray-900">Payment</h2>
              <p class="mt-4 text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
                💳 Payment on delivery is currently supported. Select your preferred payment method:
              </p>
              <div class="mt-4 space-y-3">
                <label class="flex items-center p-4 border rounded-md cursor-pointer" :class="form.payment_method === 'cod' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'">
                  <input type="radio" v-model="form.payment_method" value="cod" class="h-4 w-4 text-indigo-600" />
                  <span class="ml-3 text-sm font-medium text-gray-900">Cash on Delivery</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="mt-10 lg:mt-0 lg:col-span-5">
            <h2 class="text-lg font-medium text-gray-900">Order summary</h2>
            <div class="mt-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
              <ul role="list" class="divide-y divide-gray-200">
                <li v-for="item in cartStore.cartItems" :key="item.id" class="flex py-4 px-4">
                  <img :src="item.product?.image || 'https://via.placeholder.com/64'" :alt="item.product?.name" class="h-16 w-16 flex-none rounded-md border border-gray-200 object-cover" />
                  <div class="ml-4 flex-auto">
                    <h3 class="font-medium text-gray-900 text-sm">{{ item.product?.name }}</h3>
                    <p class="text-gray-500 text-sm">Qty {{ item.quantity }}</p>
                  </div>
                  <p class="ml-4 text-sm font-medium text-gray-900">${{ (item.product?.price * item.quantity).toFixed(2) }}</p>
                </li>
              </ul>
              <dl class="border-t border-gray-200 py-6 px-4 space-y-4">
                <div class="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt class="text-base font-medium text-gray-900">Order total</dt>
                  <dd class="text-base font-medium text-gray-900">${{ cartStore.cartTotal }}</dd>
                </div>
              </dl>
            </div>

            <div class="mt-6">
              <button type="submit" :disabled="submitting" class="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:opacity-50 flex justify-center items-center">
                <svg v-if="submitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ submitting ? 'Placing order...' : 'Confirm Order' }}
              </button>
            </div>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import axios from '../axios'

const authStore = useAuthStore()
const cartStore = useCartStore()

const submitting = ref(false)
const error = ref(null)
const orderPlaced = ref(false)
const placedOrderNumber = ref(null)

const form = reactive({
  shipping_name: authStore.user?.name || '',
  shipping_address: '',
  shipping_city: '',
  shipping_postal_code: '',
  shipping_phone: '',
  notes: '',
  payment_method: 'cod',
})

const placeOrder = async () => {
  submitting.value = true
  error.value = null
  try {
    // Build the payload the API expects
    const payload = {
      // Concatenate all address fields into one string
      shipping_address: [
        form.shipping_name,
        form.shipping_address,
        form.shipping_city,
        form.shipping_postal_code,
        form.shipping_phone,
      ].filter(Boolean).join(', '),

      payment_method: form.payment_method,

      // Map cart items to { product_id, quantity }
      items: cartStore.cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    }

    if (form.notes) {
      payload.notes = form.notes
    }

    const response = await axios.post('/orders', payload)
    const order = response.data.data || response.data
    placedOrderNumber.value = order.order_number

    // Clear cart both locally and on server
    await cartStore.clearCartServer()

    orderPlaced.value = true
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to place order. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
