<script setup lang="ts">
const emit = defineEmits<{
  export: [format: 'xlsx' | 'pdf']
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <UButton
      label="Excel"
      icon="i-lucide-file-spreadsheet"
      color="success"
      variant="outline"
      @click="emit('export', 'xlsx')"
    />
    <UButton
      label="PDF"
      icon="i-lucide-file-text"
      color="neutral"
      variant="outline"
      @click="emit('export', 'pdf')"
    />
  </div>
</template>
