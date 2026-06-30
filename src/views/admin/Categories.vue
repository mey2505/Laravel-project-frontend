<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex-1 max-w-sm">
        <input
          v-model="search"
          @input="debounceFetch"
          type="text"
          placeholder="Search categories..."
          class="w-full border border-zinc-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold rounded-md"
      >
        + New Category
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
            <th class="px-5 py-3 font-medium">Slug</th>
            <th class="px-5 py-3 font-medium">Products</th>
            <th class="px-5 py-3 font-medium">Status</th>
            <th class="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="cat in categories" :key="cat.id">
            <td class="px-5 py-3">
              <img
                :src="resolveImageUrl(cat.image) || placeholderImg"
                class="w-12 h-12 rounded-md object-cover bg-zinc-100"
              />
            </td>
            <td class="px-5 py-3 font-medium text-zinc-900">{{ cat.name }}</td>
            <td class="px-5 py-3 text-zinc-500">{{ cat.slug }}</td>
            <td class="px-5 py-3 text-zinc-600">{{ cat.products_count }}</td>
            <td class="px-5 py-3">
              <span :class="cat.status ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'" class="px-2 py-0.5 rounded-full text-xs font-medium">
                {{ cat.status ? 'Active' : 'Hidden' }}
              </span>
            </td>
            <td class="px-5 py-3 text-right space-x-3">
              <button @click="openEditModal(cat)" class="text-amber-600 hover:text-amber-700 font-medium">Edit</button>
              <button @click="confirmDelete(cat)" class="text-red-600 hover:text-red-700 font-medium">Delete</button>
            </td>
          </tr>
          <tr v-if="!categories.length">
            <td colspan="6" class="px-5 py-12 text-center text-zinc-400">No categories found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl w-full max-w-md p-6">
        <h2 class="text-lg font-semibold text-zinc-900 mb-4">{{ editingCategory ? 'Edit' : 'New' }} Category</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="formError" class="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{{ formError }}</div>

          <ImageUpload
            label="Category image"
            v-model="form.image"
            :existing-url="editingCategory ? resolveImageUrl(editingCategory.image) : ''"
          />

          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Name</label>
            <input v-model="form.name" type="text" required placeholder="e.g. Burgers" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Description</label>
            <textarea v-model="form.description" rows="2" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"></textarea>
          </div>

          <label class="flex items-center gap-2 text-sm text-zinc-700">
            <input v-model="form.status" type="checkbox" class="rounded border-zinc-300 text-amber-500 focus:ring-amber-500" />
            Visible on storefront
          </label>

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

const categories = ref([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const editingCategory = ref(null)
const submitting = ref(false)
const formError = ref(null)

const form = reactive({
  name: '',
  description: '',
  status: true,
  image: null,
})

let searchTimer = null
const debounceFetch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchCategories, 400)
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await axios.get('/admin/categories', { params: { search: search.value || undefined } })
    categories.value = response.data.data
  } catch (e) {
    console.error('Failed to load categories:', e)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.status = true
  form.image = null
  formError.value = null
}

const openCreateModal = () => {
  editingCategory.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (cat) => {
  editingCategory.value = cat
  form.name = cat.name
  form.description = cat.description || ''
  form.status = !!cat.status
  form.image = null
  formError.value = null
  showModal.value = true
}

const buildFormData = () => {
  const fd = new FormData()
  fd.append('name', form.name)
  fd.append('description', form.description || '')
  fd.append('status', form.status ? '1' : '0')
  if (form.image) fd.append('image', form.image)
  return fd
}

const handleSubmit = async () => {
  submitting.value = true
  formError.value = null
  try {
    const fd = buildFormData()
    if (editingCategory.value) {
      // POST with an explicit update route — PUT doesn't parse multipart bodies in PHP
      await axios.post(`/admin/categories/${editingCategory.value.id}`, fd)
    } else {
      await axios.post('/admin/categories', fd)
    }
    showModal.value = false
    await fetchCategories()
  } catch (e) {
    formError.value = e.response?.data?.message || Object.values(e.response?.data?.errors || {})[0]?.[0] || 'Failed to save category.'
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (cat) => {
  if (!confirm(`Delete category "${cat.name}"? Products in this category will keep their data but lose their category link.`)) return
  try {
    await axios.delete(`/admin/categories/${cat.id}`)
    await fetchCategories()
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to delete category.')
  }
}

onMounted(fetchCategories)
</script>
