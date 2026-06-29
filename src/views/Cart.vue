<template>
  <div class="bg-white">
    <div class="max-w-2xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>
      
      <div v-if="cartStore.loading" class="mt-12 py-12 flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
      <div v-else-if="cartStore.itemCount === 0" class="mt-12 text-center py-12 text-gray-500">
        Your cart is empty. <router-link to="/" class="text-indigo-600 hover:underline">Continue shopping</router-link>
      </div>
      <form v-else class="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <section aria-labelledby="cart-heading" class="lg:col-span-7">
          <h2 id="cart-heading" class="sr-only">Items in your shopping cart</h2>

          <ul role="list" class="border-t border-b border-gray-200 divide-y divide-gray-200">
            <li v-for="item in cartStore.cartItems" :key="item.id" class="flex py-6 sm:py-10">
              <div class="flex-shrink-0">
                <img :src="item.product?.image || 'https://via.placeholder.com/150'" :alt="item.product?.name" class="w-24 h-24 rounded-md object-center object-cover sm:w-48 sm:h-48" />
              </div>

              <div class="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                <div class="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                  <div>
                    <div class="flex justify-between">
                      <h3 class="text-sm">
                        <router-link :to="`/product/${item.product?.slug}`" class="font-medium text-gray-700 hover:text-gray-800">{{ item.product?.name }}</router-link>
                      </h3>
                    </div>
                    <p class="mt-1 text-sm font-medium text-gray-900">${{ item.product?.price }}</p>
                    <p class="mt-1 text-sm text-gray-500">Qty: {{ item.quantity }}</p>
                  </div>
                  
                  <div class="mt-4 sm:mt-0 sm:pr-9">
                    <div class="absolute top-0 right-0">
                      <button type="button" @click="removeItem(item.id)" class="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500">
                        <span class="sr-only">Remove</span>
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <!-- Order summary -->
        <section aria-labelledby="summary-heading" class="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5">
          <h2 id="summary-heading" class="text-lg font-medium text-gray-900">Order summary</h2>

          <dl class="mt-6 space-y-4">
            <div class="flex items-center justify-between">
              <dt class="text-sm text-gray-600">Subtotal</dt>
              <dd class="text-sm font-medium text-gray-900">${{ cartStore.cartTotal }}</dd>
            </div>
            <div class="border-t border-gray-200 pt-4 flex items-center justify-between">
              <dt class="text-base font-medium text-gray-900">Order total</dt>
              <dd class="text-base font-medium text-gray-900">${{ cartStore.cartTotal }}</dd>
            </div>
          </dl>

          <div class="mt-6">
            <router-link to="/checkout" class="w-full flex justify-center items-center bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500">Checkout</router-link>
          </div>
        </section>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()

const removeItem = async (id) => {
  try {
    await cartStore.removeFromCart(id)
  } catch (error) {
    alert('Could not remove item')
  }
}
</script>
