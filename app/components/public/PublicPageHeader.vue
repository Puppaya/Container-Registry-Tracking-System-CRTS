<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  backTo?: string
  mono?: boolean
}>()
</script>

<template>
  <div class="w-full min-w-0">
    <div class="flex w-full items-start gap-3">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        size="sm"
        class="mt-0.5 shrink-0"
        :to="backTo || '/public'"
      />
      <div class="min-w-0 flex-1">
        <h1 class="text-lg font-bold leading-snug sm:text-xl break-words">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="mt-1.5 text-sm leading-relaxed text-muted break-words"
          :class="mono ? 'font-mono' : ''"
        >
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>
