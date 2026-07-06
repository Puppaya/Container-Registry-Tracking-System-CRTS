<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  loading?: boolean
}>()
</script>

<template>
  <div class="page-module-header">
    <div class="space-y-1 min-w-0">
      <h1 class="ds-headline-lg">
        {{ title }}
      </h1>
      <p v-if="description" class="ds-body-md">
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
