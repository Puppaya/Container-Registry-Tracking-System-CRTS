<script setup lang="ts">
defineProps<{
  scrollable?: boolean
}>()
</script>

<template>
  <div
    class="flex min-h-0 flex-1 flex-col"
    :class="scrollable ? 'overflow-y-auto' : undefined"
  >
    <slot />
  </div>
</template>
