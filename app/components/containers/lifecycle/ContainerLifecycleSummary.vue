<script setup lang="ts">
import type { LifecycleSummary } from '~/types'
import { EVENT_TYPE_ICONS, EVENT_TYPE_LABELS } from '~/utils/container-events'

defineProps<{
  summary: LifecycleSummary | null | undefined
  loading?: boolean
}>()
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">Total Events</p>
      <p class="text-2xl font-semibold">
        {{ loading ? '…' : (summary?.totalEvents ?? 0) }}
      </p>
    </UCard>

    <UCard
      v-for="item in summary?.byEventType?.slice(0, 3) || []"
      :key="item.eventType"
      :ui="{ body: 'p-4' }"
    >
      <div class="flex items-center gap-2 text-sm text-muted mb-1">
        <UIcon :name="EVENT_TYPE_ICONS[item.eventType as keyof typeof EVENT_TYPE_ICONS] || 'i-lucide-circle'" class="size-4" />
        {{ EVENT_TYPE_LABELS[item.eventType as keyof typeof EVENT_TYPE_LABELS] || item.eventType }}
      </div>
      <p class="text-2xl font-semibold">{{ item.count }}</p>
    </UCard>
  </div>
</template>
