<script setup lang="ts">
import { DOCUMENT_TYPES } from '~/utils/documents'

const props = defineProps<{
  containerId: number
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const documentType = ref('Other')
const selectedFile = ref<File | null>(null)
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

const { execute: runUpload, loading } = useApiAction()

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] || null
}

function clearFile() {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function submitUpload() {
  if (!selectedFile.value) return

  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('documentType', documentType.value)

  const { error } = await runUpload(
    () => $fetch(`/api/containers/${props.containerId}/documents`, {
      method: 'POST',
      body: formData
    }) as Promise<any>,
    { successMessage: 'ອັບໂຫລດເອກະສານສຳເລັດ' }
  )

  if (!error) {
    clearFile()
    documentType.value = 'Other'
    emit('success')
  }
}
</script>

<template>
  <div class="space-y-6">
    <UFormField label="ປະເພດເອກະສານ">
      <USelect
        v-model="documentType"
        :items="DOCUMENT_TYPES"
        class="w-full"
      />
    </UFormField>

    <UFormField label="ໄຟລ์">
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx"
        class="block w-full text-sm text-neutral-500 file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary"
        @change="onFileChange"
      />

      <div
        v-if="selectedFile"
        class="mt-3 flex items-center justify-between gap-3 rounded-lg border border-default bg-elevated/30 px-3 py-2"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium">{{ selectedFile.name }}</p>
          <p class="text-xs text-muted">{{ Math.round(selectedFile.size / 1024) }} KB</p>
        </div>
        <UButton
          icon="i-lucide-trash-2"
          label="ລົບ"
          color="error"
          variant="ghost"
          size="sm"
          @click="clearFile"
        />
      </div>

      <p class="mt-1 text-xs text-neutral-400">
        PDF, Image, Word, Excel — ສູງສຸດ 10MB
      </p>
    </UFormField>

    <div class="flex justify-end gap-3 border-t border-default pt-6">
      <UButton label="ຍົກເລີກ" color="neutral" variant="outline" @click="$emit('cancel')" />
      <UButton
        label="ອັບໂຫລດ"
        icon="i-lucide-upload"
        :loading="loading"
        :disabled="!selectedFile"
        @click="submitUpload"
      />
    </div>
  </div>
</template>
