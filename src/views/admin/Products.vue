<template>
  <div>
    <div class="flex items-center justify-between mb-6 gap-3">
      <div class="flex gap-3 flex-1 max-w-xl">
        <input
          v-model="search"
          @input="debounceFetch"
          type="text"
          placeholder="Search products or SKU..."
          class="flex-1 border border-zinc-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <select
          v-model="categoryFilter"
          @change="fetchProducts"
          class="border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All categories</option>
          <option v-for="cat in allCategories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
        </select>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold rounded-md whitespace-nowrap"
      >
        + New Product
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
    </div>

    <div v-else class="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-zinc-50 text-zinc-500 text-left">
          <tr>
            <th class="px-5 py-3 font-medium">Image</th>
            <th class="px-5 py-3 font-medium">Name</th>
            <th class="px-5 py-3 font-medium">Category</th>
            <th class="px-5 py-3 font-medium">Price</th>
            <th class="px-5 py-3 font-medium">Stock</th>
            <th class="px-5 py-3 font-medium">Status</th>
            <th class="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="p in products" :key="p.id">
            <td class="px-5 py-3">
              <img :src="resolveImageUrl(p.image) || placeholderImg" class="w-12 h-12 rounded-md object-cover bg-zinc-100" />
            </td>
            <td class="px-5 py-3 font-medium text-zinc-900">
              {{ p.name }}
              <span v-if="p.featured" class="ml-1 text-amber-500" title="Featured">★</span>
            </td>
            <td class="px-5 py-3 text-zinc-500">{{ p.category?.name || '—' }}</td>
            <td class="px-5 py-3 text-zinc-900">
              ${{ p.discount_price ?? p.price }}
              <span v-if="p.discount_price" class="text-zinc-400 line-through ml-1">${{ p.price }}</span>
            </td>
            <td class="px-5 py-3">
              <span :class="p.stock <= 5 ? 'text-red-600 font-medium' : 'text-zinc-600'">{{ p.stock }}</span>
            </td>
            <td class="px-5 py-3">
              <span :class="p.status ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'" class="px-2 py-0.5 rounded-full text-xs font-medium">
                {{ p.status ? 'Active' : 'Hidden' }}
              </span>
            </td>
            <td class="px-5 py-3 text-right space-x-3">
              <button @click="openEditModal(p)" class="text-amber-600 hover:text-amber-700 font-medium">Edit</button>
              <button
                @click="toggleStatus(p)"
                :disabled="togglingStatusId === p.id"
                class="text-zinc-600 hover:text-zinc-900 font-medium"
              >
                {{ p.status ? 'Hide' : 'Activate' }}
              </button>
              <button @click="confirmDelete(p)" class="text-red-600 hover:text-red-700 font-medium">Delete</button>
            </td>
          </tr>
          <tr v-if="!products.length">
            <td colspan="7" class="px-5 py-12 text-center text-zinc-400">No products found.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pagination && pagination.last_page > 1" class="flex justify-center gap-2 py-4 border-t border-zinc-100">
        <button
          v-for="page in pagination.last_page"
          :key="page"
          @click="fetchProducts(page)"
          :class="page === pagination.current_page ? 'bg-amber-500 text-zinc-950' : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50'"
          class="w-8 h-8 text-sm rounded-md"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-xl w-full max-w-lg p-6 my-8">
        <h2 class="text-lg font-semibold text-zinc-900 mb-4">{{ editingProduct ? 'Edit' : 'New' }} Product</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="formError" class="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{{ formError }}</div>

          <ImageUpload
            label="Product image"
            v-model="form.image"
            :existing-url="editingProduct ? resolveImageUrl(editingProduct.image) : ''"
          />

          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-zinc-700 mb-1.5">Name</label>
              <input v-model="form.name" type="text" required placeholder="e.g. Classic Cheeseburger" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-1.5">Category</label>
              <select v-model="form.category_id" required class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="" disabled>Select category</option>
                <option v-for="cat in allCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-1.5">SKU</label>
              <input v-model="form.sku" type="text" required placeholder="e.g. BURG-1" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-1.5">Price ($)</label>
              <input v-model="form.price" type="number" step="0.01" min="0" required class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-1.5">Discount price ($)</label>
              <input v-model="form.discount_price" type="number" step="0.01" min="0" placeholder="Optional" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-1.5">Stock</label>
              <input v-model="form.stock" type="number" min="0" required class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-zinc-700 mb-1.5">Description</label>
              <textarea v-model="form.description" rows="2" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"></textarea>
            </div>
          </div>

          <div class="flex gap-6">
            <label class="flex items-center gap-2 text-sm text-zinc-700">
              <input v-model="form.status" type="checkbox" class="rounded border-zinc-300 text-amber-500 focus:ring-amber-500" />
              Visible on storefront
            </label>
            <label class="flex items-center gap-2 text-sm text-zinc-700">
              <input v-model="form.featured" type="checkbox" class="rounded border-zinc-300 text-amber-500 focus:ring-amber-500" />
              Featured
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showModal = false" class="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 rounded-md">Cancel</button>
            <button type="submit" :disabled="submitting" class="px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-md disabled:opacity-50">
              {{ submitting ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios, { resolveImageUrl } from '../../axios'
import ImageUpload from '../../components/admin/ImageUpload.vue'

const placeholderImg = 'https://placehold.co/100x100?text=No+Image'

const products = ref([])
const allCategories = ref([])
const loading = ref(true)
const search = ref('')
const categoryFilter = ref('')
const pagination = ref(null)
const showModal = ref(false)
const editingProduct = ref(null)
const submitting = ref(false)
const togglingStatusId = ref(null)
const formError = ref(null)

const form = reactive({
  name: '',
  category_id: '',
  sku: '',
  price: '',
  discount_price: '',
  stock: 0,
  description: '',
  status: true,
  featured: false,
  image: null,
})

let searchTimer = null
const debounceFetch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchProducts(), 400)
}

const fetchProducts = async (page = 1) => {
  loading.value = true
  try {
    const response = await axios.get('/admin/products', {
      params: {
        page,
        search: search.value || undefined,
        category: categoryFilter.value || undefined,
      },
    })
    products.value = response.data.data
    pagination.value = response.data.meta
  } catch (e) {
    console.error('Failed to load products:', e)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    // Admin categories list isn't paginated away if we ask for a big page size
    const response = await axios.get('/admin/categories', { params: { per_page: 100 } })
    allCategories.value = response.data.data
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
}

const resetForm = () => {
  form.name = ''
  form.category_id = ''
  form.sku = ''
  form.price = ''
  form.discount_price = ''
  form.stock = 0
  form.description = ''
  form.status = true
  form.featured = false
  form.image = null
  formError.value = null
}

const openCreateModal = () => {
  editingProduct.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (p) => {
  editingProduct.value = p
  form.name = p.name
  form.category_id = p.category?.id || ''
  form.sku = p.sku || ''
  form.price = p.price
  form.discount_price = p.discount_price ?? ''
  form.stock = p.stock
  form.description = p.description || ''
  form.status = !!p.status
  form.featured = !!p.featured
  form.image = null
  formError.value = null
  showModal.value = true
}

const buildFormData = () => {
  const fd = new FormData()
  fd.append('name', form.name)
  fd.append('category_id', form.category_id)
  fd.append('sku', form.sku)
  fd.append('price', form.price)
  if (form.discount_price !== '' && form.discount_price !== null) {
    fd.append('discount_price', form.discount_price)
  }
  fd.append('stock', form.stock)
  fd.append('description', form.description || '')
  fd.append('status', form.status ? '1' : '0')
  fd.append('featured', form.featured ? '1' : '0')
  if (form.image) fd.append('image', form.image)
  return fd
}

const handleSubmit = async () => {
  submitting.value = true
  formError.value = null
  try {
    const fd = buildFormData()
    if (editingProduct.value) {
      await axios.post(`/admin/products/${editingProduct.value.id}`, fd)
    } else {
      await axios.post('/admin/products', fd)
    }
    showModal.value = false
    await fetchProducts(pagination.value?.current_page || 1)
  } catch (e) {
    formError.value = e.response?.data?.message || Object.values(e.response?.data?.errors || {})[0]?.[0] || 'Failed to save product.'
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (p) => {
  if (!confirm(`Delete product "${p.name}"?`)) return
  try {
    await axios.delete(`/admin/products/${p.id}`)
    await fetchProducts(pagination.value?.current_page || 1)
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to delete product.')
  }
}

const toggleStatus = async (p) => {
  togglingStatusId.value = p.id
  try {
    await axios.put(`/admin/products/${p.id}/status`, { status: p.status ? 0 : 1 })
    p.status = !p.status
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to update product status.')
  } finally {
    togglingStatusId.value = null
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>
