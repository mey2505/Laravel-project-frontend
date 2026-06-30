<template>
  <div class="max-w-3xl">
    <div v-if="loading" class="flex justify-center py-16">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-8">
      <div v-if="successMessage" class="bg-green-50 text-green-700 text-sm rounded-md px-4 py-3">{{ successMessage }}</div>
      <div v-if="formError" class="bg-red-50 text-red-700 text-sm rounded-md px-4 py-3">{{ formError }}</div>

      <!-- Hero section -->
      <section class="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 class="font-semibold text-zinc-900 mb-1">Homepage Hero Banner</h2>
        <p class="text-sm text-zinc-500 mb-5">This is the big dark banner customers see first on your homepage.</p>

        <div class="space-y-4">
          <ImageUpload
            label="Hero image"
            v-model="form.hero_image"
            :existing-url="resolveImageUrl(originalHeroImage)"
          />

          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Headline</label>
            <input v-model="form.hero_title" type="text" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Subtext</label>
            <textarea v-model="form.hero_subtitle" rows="2" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Button text</label>
            <input v-model="form.hero_button_text" type="text" class="w-full max-w-xs border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>

        <!-- Live preview -->
        <div class="mt-6">
          <p class="text-xs font-medium text-zinc-500 mb-2">Preview</p>
          <div class="relative bg-black rounded-lg overflow-hidden h-48 flex items-center px-6">
            <img v-if="heroPreviewUrl" :src="heroPreviewUrl" class="absolute right-0 top-0 h-full object-contain opacity-90" />
            <div class="relative z-10 max-w-[60%]">
              <p class="text-white font-script text-xl">{{ form.hero_title || 'Bite into happiness' }}</p>
              <p class="text-zinc-300 text-xs mt-2 line-clamp-2">{{ form.hero_subtitle }}</p>
              <span class="inline-block mt-3 bg-amber-400 text-black text-xs font-semibold px-3 py-1.5 rounded">{{ form.hero_button_text || 'Order Now' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- General -->
      <section class="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 class="font-semibold text-zinc-900 mb-1">General</h2>
        <p class="text-sm text-zinc-500 mb-5">Store name and basic business info.</p>

        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Site name</label>
            <input v-model="form.site_name" type="text" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Site description</label>
            <input v-model="form.site_description" type="text" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Currency symbol</label>
            <input v-model="form.currency" type="text" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Tax rate (%)</label>
            <input v-model="form.tax_rate" type="number" step="0.1" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Shipping fee</label>
            <input v-model="form.shipping_fee" type="number" step="0.01" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">Order prefix</label>
            <input v-model="form.order_prefix" type="text" class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
      </section>

      <div class="flex justify-end">
        <button type="submit" :disabled="submitting" class="px-5 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-md disabled:opacity-50">
          {{ submitting ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios, { resolveImageUrl } from '../../axios'
import ImageUpload from '../../components/admin/ImageUpload.vue'

const loading = ref(true)
const submitting = ref(false)
const formError = ref(null)
const successMessage = ref(null)
const originalHeroImage = ref('')

const form = reactive({
  hero_title: '',
  hero_subtitle: '',
  hero_button_text: '',
  hero_image: null, // File when changed, else null
  site_name: '',
  site_description: '',
  currency: '',
  tax_rate: '',
  shipping_fee: '',
  order_prefix: '',
})

const heroPreviewUrl = computed(() => {
  if (form.hero_image instanceof File) return URL.createObjectURL(form.hero_image)
  return resolveImageUrl(originalHeroImage.value)
})

const fetchSettings = async () => {
  loading.value = true
  try {
    const response = await axios.get('/admin/settings')
    const data = response.data.data
    form.hero_title = data.hero_title || ''
    form.hero_subtitle = data.hero_subtitle || ''
    form.hero_button_text = data.hero_button_text || ''
    originalHeroImage.value = data.hero_image || ''
    form.site_name = data.site_name || ''
    form.site_description = data.site_description || ''
    form.currency = data.currency || ''
    form.tax_rate = data.tax_rate || ''
    form.shipping_fee = data.shipping_fee || ''
    form.order_prefix = data.order_prefix || ''
  } catch (e) {
    formError.value = 'Failed to load settings.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  submitting.value = true
  formError.value = null
  successMessage.value = null
  try {
    const fd = new FormData()
    fd.append('hero_title', form.hero_title || '')
    fd.append('hero_subtitle', form.hero_subtitle || '')
    fd.append('hero_button_text', form.hero_button_text || '')
    if (form.hero_image instanceof File) fd.append('hero_image', form.hero_image)
    fd.append('site_name', form.site_name || '')
    fd.append('site_description', form.site_description || '')
    fd.append('currency', form.currency || '')
    fd.append('tax_rate', form.tax_rate || '')
    fd.append('shipping_fee', form.shipping_fee || '')
    fd.append('order_prefix', form.order_prefix || '')

    const response = await axios.post('/admin/settings', fd)
    originalHeroImage.value = response.data.data.hero_image || originalHeroImage.value
    form.hero_image = null
    successMessage.value = 'Settings saved successfully.'
  } catch (e) {
    formError.value = e.response?.data?.message || 'Failed to save settings.'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchSettings)
</script>
