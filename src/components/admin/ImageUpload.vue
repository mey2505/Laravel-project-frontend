<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-zinc-700 mb-1.5">{{ label }}</label>
    <div class="flex items-center gap-4">
      <div class="w-24 h-24 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
        <img v-if="previewUrl" :src="previewUrl" class="w-full h-full object-cover" />
        <svg v-else class="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div class="flex-1">
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          class="hidden"
          @change="handleFileChange"
        />
        <button
          type="button"
          @click="fileInput.click()"
          class="px-3 py-1.5 text-sm font-medium rounded-md border border-zinc-300 hover:bg-zinc-50"
        >
          {{ previewUrl ? 'Change image' : 'Upload image' }}
        </button>
        <button
          v-if="previewUrl"
          type="button"
          @click="clearImage"
          class="ml-2 px-3 py-1.5 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
        >
          Remove
        </button>
        <p class="text-xs text-zinc-400 mt-1.5">JPG, PNG or WEBP. Max 2MB.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  modelValue: { type: [File, null], default: null },
  // Existing image URL (when editing), shown until a new file is chosen
  existingUrl: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'cleared'])

const fileInput = ref(null)
const previewUrl = ref(props.existingUrl || '')

watch(() => props.existingUrl, (val) => {
  if (!props.modelValue) previewUrl.value = val || ''
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  emit('update:modelValue', file)
  previewUrl.value = URL.createObjectURL(file)
}

const clearImage = () => {
  emit('update:modelValue', null)
  emit('cleared')
  previewUrl.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
</script>
