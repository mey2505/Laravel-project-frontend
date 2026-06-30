<template>
  <div>
    <!-- ── Hero ─────────────────────────────────────────────────────────── -->
    <section class="relative bg-zinc-950 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 items-center gap-8 min-h-[480px] lg:min-h-[560px]">
        <div class="relative z-10 py-16 lg:py-0">
          <span class="inline-block text-xs font-semibold tracking-widest text-amber-400 uppercase mb-3">Fresh &amp; Fast</span>
          <h1 class="font-script text-4xl sm:text-5xl text-white leading-tight">
            {{ hero.hero_title || 'Bite into happiness' }}
          </h1>
          <p class="mt-5 text-zinc-300 text-base max-w-md leading-relaxed">
            {{ hero.hero_subtitle || 'Restaurant-quality food, delivered fast. Browse our full menu and order in seconds.' }}
          </p>
          <div class="flex gap-3 mt-7">
            <router-link to="/menu" class="inline-block bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold px-7 py-3 rounded-md transition-colors">
              {{ hero.hero_button_text || 'Order Now' }}
            </router-link>
            <router-link v-if="authStore.isAuthenticated" to="/orders" class="inline-block border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium px-6 py-3 rounded-md transition-colors">
              My Orders
            </router-link>
          </div>
        </div>

        <div class="relative h-full flex items-end justify-center lg:justify-end">
          <img
            v-if="resolveImageUrl(hero.hero_image)"
            :src="resolveImageUrl(hero.hero_image)"
            alt="Featured dish"
            class="w-[420px] sm:w-[500px] lg:w-[700px] xl:w-[780px] h-auto object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.6)] transition-all duration-300"
          />
          <div v-else class="flex flex-col items-center justify-center text-zinc-600 py-16">
            <svg class="w-28 h-28 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12h18M5 12a7 7 0 0114 0M4 15h16l-1.5 4.5a2 2 0 01-1.9 1.5H7.4a2 2 0 01-1.9-1.5L4 15z" />
            </svg>
            <p class="text-sm mt-3 text-zinc-500">Upload a hero image from Admin → Settings</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Promo banner ───────────────────────────────────────────────── -->
    <div class="bg-amber-400">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-center gap-6 text-zinc-950 text-sm font-medium">
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Ready in 20 minutes
        </span>
        <span class="w-px h-4 bg-amber-600/40 hidden sm:block"></span>
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Free shipping over $30
        </span>
        <span class="w-px h-4 bg-amber-600/40 hidden sm:block"></span>
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          Fresh ingredients daily
        </span>
      </div>
    </div>

    <!-- ── Categories ─────────────────────────────────────────────────── -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="flex items-center justify-between mb-7">
        <h2 class="text-2xl font-bold text-zinc-900">Browse by category</h2>
        <router-link to="/menu" class="text-sm font-medium text-amber-600 hover:text-amber-700">View all →</router-link>
      </div>

      <div v-if="categoriesLoading" class="flex gap-4 overflow-x-auto pb-2">
        <div v-for="n in 6" :key="n" class="w-32 h-32 flex-shrink-0 rounded-xl bg-zinc-100 animate-pulse"></div>
      </div>

      <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        <router-link
          v-for="cat in categories"
          :key="cat.id"
          :to="`/menu?category=${cat.slug}`"
          @click="$router.push({ path: '/menu', query: { category: cat.slug } })"
          class="group flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 hover:bg-amber-50 border border-zinc-100 hover:border-amber-200 transition-all"
        >
          <div class="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold group-hover:bg-amber-200 transition-colors">
            {{ cat.name.charAt(0) }}
          </div>
          <span class="text-xs font-semibold text-zinc-700 text-center">{{ cat.name }}</span>
        </router-link>
      </div>
    </section>

    <!-- ── Featured products ───────────────────────────────────────────── -->
    <section class="bg-zinc-50 py-14">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-7">
          <div>
            <h2 class="text-2xl font-bold text-zinc-900">Featured items</h2>
            <p class="mt-1 text-sm text-zinc-500">Chef's picks — always a hit</p>
          </div>
          <router-link to="/menu" class="text-sm font-medium text-amber-600 hover:text-amber-700">See full menu →</router-link>
        </div>

        <div v-if="featuredLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="n in 4" :key="n" class="rounded-xl bg-white border border-zinc-100 overflow-hidden animate-pulse">
            <div class="h-48 bg-zinc-100"></div>
            <div class="p-4 space-y-2">
              <div class="h-3 bg-zinc-100 rounded w-1/3"></div>
              <div class="h-4 bg-zinc-100 rounded w-3/4"></div>
              <div class="h-4 bg-zinc-100 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="product in featured"
            :key="product.id"
            class="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-zinc-100 flex flex-col"
          >
            <router-link :to="{ name: 'ProductDetails', params: { slug: product.slug } }" class="relative block w-full h-48 bg-zinc-100 overflow-hidden">
              <img
                :src="resolveImageUrl(product.image) || 'https://placehold.co/400x300?text=No+Image'"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span v-if="product.discount_price" class="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">Sale</span>
              <div class="absolute top-2 left-2 bg-amber-400 text-zinc-950 text-xs font-bold px-2 py-1 rounded">⭐ Featured</div>
            </router-link>

            <!-- Wishlist -->
            <button
              v-if="authStore.isAuthenticated"
              @click.prevent="toggleWishlist(product)"
              class="absolute top-2 right-10 p-1.5 rounded-full bg-white/90 shadow hover:bg-white transition-colors"
            >
              <svg class="w-4 h-4 transition-colors" :class="wishlistStore.isWishlisted(product.id) ? 'text-red-500 fill-red-500' : 'text-zinc-400'" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>

            <div class="p-4 flex flex-col flex-grow">
              <p class="text-xs text-amber-600 font-medium mb-1">{{ product.category?.name }}</p>
              <router-link :to="{ name: 'ProductDetails', params: { slug: product.slug } }">
                <h3 class="text-sm font-semibold text-zinc-900 hover:text-amber-600 transition-colors line-clamp-2">{{ product.name }}</h3>
              </router-link>

              <div v-if="product.reviews_count > 0" class="flex items-center gap-1 mt-1.5">
                <svg v-for="n in 5" :key="n" class="h-3.5 w-3.5" :class="n <= Math.round(product.reviews_avg) ? 'text-amber-400' : 'text-zinc-200'" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span class="text-xs text-zinc-400">({{ product.reviews_count }})</span>
              </div>

              <div class="mt-auto pt-3 flex items-end justify-between gap-2">
                <div>
                  <span class="text-base font-bold text-zinc-900">${{ product.discount_price ?? product.price }}</span>
                  <span v-if="product.discount_price" class="ml-1.5 text-xs text-zinc-400 line-through">${{ product.price }}</span>
                </div>
                <button
                  v-if="product.in_stock"
                  @click="addToCart(product)"
                  :disabled="addingId === product.id"
                  class="bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                >
                  {{ addingId === product.id ? 'Adding…' : 'Add' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Sale / Deals section ───────────────────────────────────────── -->
    <section v-if="onSale.length" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="flex items-center justify-between mb-7">
        <div>
          <h2 class="text-2xl font-bold text-zinc-900">Today's deals</h2>
          <p class="mt-1 text-sm text-zinc-500">Limited-time savings on your favorites</p>
        </div>
        <router-link to="/menu?on_sale=1" class="text-sm font-medium text-amber-600 hover:text-amber-700">All deals →</router-link>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="product in onSale"
          :key="product.id"
          class="flex gap-4 bg-white rounded-xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow p-4 items-center"
        >
          <router-link :to="{ name: 'ProductDetails', params: { slug: product.slug } }" class="w-24 h-24 flex-shrink-0 rounded-lg bg-zinc-100 overflow-hidden">
            <img
              :src="resolveImageUrl(product.image) || 'https://placehold.co/200x200?text=🍔'"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
          </router-link>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-amber-600 font-medium">{{ product.category?.name }}</p>
            <router-link :to="{ name: 'ProductDetails', params: { slug: product.slug } }">
              <h3 class="text-sm font-semibold text-zinc-900 hover:text-amber-600 transition-colors line-clamp-2">{{ product.name }}</h3>
            </router-link>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="text-base font-bold text-red-600">${{ product.discount_price }}</span>
              <span class="text-sm text-zinc-400 line-through">${{ product.price }}</span>
              <span class="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-1.5 py-0.5 rounded">
                -{{ Math.round((1 - product.discount_price / product.price) * 100) }}%
              </span>
            </div>
            <button
              v-if="product.in_stock"
              @click="addToCart(product)"
              :disabled="addingId === product.id"
              class="mt-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors w-full disabled:opacity-50"
            >
              {{ addingId === product.id ? 'Adding…' : 'Add to cart' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="fixed bottom-6 right-6 bg-zinc-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ toast }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios, { resolveImageUrl } from '../axios'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'

const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const categories = ref([])
const featured = ref([])
const onSale = ref([])
const categoriesLoading = ref(true)
const featuredLoading = ref(true)
const addingId = ref(null)
const toast = ref(null)
let toastTimer = null

const hero = ref({
  hero_title: '',
  hero_subtitle: '',
  hero_button_text: '',
  hero_image: '',
})

const showToast = (msg) => {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 2500)
}

const fetchCategories = async () => {
  categoriesLoading.value = true
  try {
    const r = await axios.get('/categories')
    categories.value = (r.data.data || r.data).slice(0, 6)
  } catch (e) {
    console.error(e)
  } finally {
    categoriesLoading.value = false
  }
}

const fetchFeatured = async () => {
  featuredLoading.value = true
  try {
    const [featRes, saleRes] = await Promise.all([
      axios.get('/products', { params: { featured: 1, per_page: 4 } }),
      axios.get('/products', { params: { on_sale: 1, per_page: 3 } }),
    ])
    featured.value = featRes.data.data
    onSale.value = saleRes.data.data.filter(p => p.discount_price)
  } catch (e) {
    console.error(e)
  } finally {
    featuredLoading.value = false
  }
}

const fetchHero = async () => {
  try {
    const r = await axios.get('/settings')
    const d = r.data.data || {}
    Object.assign(hero.value, d)
  } catch (e) {
    console.error(e)
  }
}

const addToCart = async (product) => {
  if (!authStore.isAuthenticated) {
    showToast('Please sign in to add items to cart')
    return
  }
  addingId.value = product.id
  try {
    await cartStore.addToCart(product.id)
    showToast(`${product.name} added to cart`)
  } catch (e) {
    showToast(e.message || 'Failed to add to cart')
  } finally {
    addingId.value = null
  }
}

const toggleWishlist = async (product) => {
  try {
    const added = await wishlistStore.toggle(product.id)
    showToast(added ? `${product.name} saved to wishlist` : `${product.name} removed`)
  } catch (e) {
    showToast(e.message || 'Failed to update wishlist')
  }
}

onMounted(() => {
  fetchCategories()
  fetchFeatured()
  fetchHero()
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
