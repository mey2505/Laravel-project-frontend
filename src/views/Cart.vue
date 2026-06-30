<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-bold text-zinc-900 mb-8">Shopping Cart</h1>

    <div v-if="cartStore.loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400"></div>
    </div>

    <div v-else-if="cartStore.itemCount === 0" class="text-center py-24">
      <svg class="mx-auto h-14 w-14 text-zinc-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="text-lg font-semibold text-zinc-900">Your cart is empty</h3>
      <p class="mt-1 text-sm text-zinc-500">Add something delicious to get started.</p>
      <router-link to="/menu" class="mt-6 inline-block bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold px-6 py-2.5 rounded-md transition-colors">Browse menu</router-link>
    </div>

    <div v-else class="lg:grid lg:grid-cols-12 lg:gap-8">
      <!-- Cart items -->
      <div class="lg:col-span-7">
        <ul class="space-y-4">
          <li
            v-for="item in cartStore.cartItems"
            :key="item.id"
            class="flex gap-4 bg-white rounded-xl border border-zinc-100 shadow-sm p-4 items-center"
          >
            <div class="w-20 h-20 flex-shrink-0 rounded-lg bg-zinc-100 overflow-hidden">
              <img
                :src="item.product?.image ? resolveImageUrl(item.product.image) : 'https://placehold.co/80x80?text=?'"
                :alt="item.product?.name"
                class="w-full h-full object-cover"
              />
            </div>

            <div class="flex-1 min-w-0">
              <router-link :to="`/product/${item.product?.slug}`" class="text-sm font-semibold text-zinc-900 hover:text-amber-600 transition-colors line-clamp-2">
                {{ item.product?.name }}
              </router-link>
              <p class="text-xs text-zinc-500 mt-0.5">{{ item.product?.category?.name }}</p>

              <!-- Quantity controls -->
              <div class="flex items-center gap-2 mt-2">
                <button
                  @click="decreaseQty(item)"
                  :disabled="item.quantity <= 1 || updatingId === item.id"
                  class="w-6 h-6 flex items-center justify-center border border-zinc-300 rounded text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 transition-colors text-sm"
                >−</button>
                <span class="text-sm font-medium text-zinc-900 w-6 text-center">{{ item.quantity }}</span>
                <button
                  @click="increaseQty(item)"
                  :disabled="updatingId === item.id"
                  class="w-6 h-6 flex items-center justify-center border border-zinc-300 rounded text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 transition-colors text-sm"
                >+</button>
                <div v-if="updatingId === item.id" class="w-3 h-3 border-b border-amber-400 rounded-full animate-spin ml-1"></div>
              </div>
            </div>

            <div class="flex flex-col items-end gap-2">
              <p class="text-sm font-bold text-zinc-900">${{ ((item.product?.discount_price ?? item.product?.price ?? 0) * item.quantity).toFixed(2) }}</p>
              <p class="text-xs text-zinc-400">${{ item.product?.discount_price ?? item.product?.price }} each</p>
              <button
                @click="removeItem(item.id)"
                class="text-xs text-red-500 hover:text-red-700 transition-colors font-medium"
              >
                Remove
              </button>
            </div>
          </li>
        </ul>

        <div class="mt-4 flex justify-between items-center">
          <router-link to="/menu" class="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Continue shopping
          </router-link>
          <button @click="clearCart" class="text-sm text-zinc-400 hover:text-red-500 transition-colors">Clear cart</button>
        </div>
      </div>

      <!-- Summary -->
      <div class="mt-8 lg:mt-0 lg:col-span-5">
        <div class="bg-zinc-50 rounded-xl border border-zinc-200 p-6 sticky top-20">
          <h2 class="text-base font-semibold text-zinc-900 mb-5">Order summary</h2>

          <div class="space-y-3 text-sm">
            <div v-for="item in cartStore.cartItems" :key="item.id" class="flex justify-between text-zinc-600">
              <span class="truncate max-w-[180px]">{{ item.product?.name }} × {{ item.quantity }}</span>
              <span>${{ ((item.product?.discount_price ?? item.product?.price ?? 0) * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <div class="mt-5 pt-4 border-t border-zinc-200 space-y-2 text-sm">
            <div class="flex justify-between text-zinc-500">
              <span>Subtotal</span><span>${{ cartStore.cartTotal }}</span>
            </div>
            <div class="flex justify-between text-zinc-500">
              <span>Shipping</span><span class="text-green-600">Calculated at checkout</span>
            </div>
            <div class="flex justify-between text-base font-bold text-zinc-900 pt-2 border-t border-zinc-200">
              <span>Estimated total</span><span>${{ cartStore.cartTotal }}</span>
            </div>
          </div>

          <router-link
            to="/checkout"
            class="mt-6 flex w-full items-center justify-center bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold py-3 rounded-md transition-colors"
          >
            Proceed to checkout →
          </router-link>
          <p class="mt-3 text-center text-xs text-zinc-400">Secure checkout · Free returns</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { resolveImageUrl } from '../axios'
import { useCartStore } from '../stores/cart'
import axios from '../axios'

const cartStore = useCartStore()
const updatingId = ref(null)

const removeItem = async (id) => {
  try {
    await cartStore.removeFromCart(id)
  } catch (e) {
    alert('Could not remove item')
  }
}

const clearCart = async () => {
  if (!confirm('Remove all items from your cart?')) return
  try {
    await cartStore.clearCartServer()
  } catch (e) {
    alert('Could not clear cart')
  }
}

const increaseQty = async (item) => {
  updatingId.value = item.id
  try {
    await axios.put(`/cart/${item.id}`, { quantity: item.quantity + 1 })
    await cartStore.fetchCart()
  } catch (e) {
    console.error(e)
  } finally {
    updatingId.value = null
  }
}

const decreaseQty = async (item) => {
  if (item.quantity <= 1) return
  updatingId.value = item.id
  try {
    await axios.put(`/cart/${item.id}`, { quantity: item.quantity - 1 })
    await cartStore.fetchCart()
  } catch (e) {
    console.error(e)
  } finally {
    updatingId.value = null
  }
}
</script>
