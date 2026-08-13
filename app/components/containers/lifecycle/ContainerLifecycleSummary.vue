<script setup lang="ts">
import type { LifecycleSummary, ContainerEventType } from '~/types'
import { EVENT_TYPE_ICONS } from '~/utils/container-events'

const { t } = useI18n()

defineProps<{
  summary: LifecycleSummary | null | undefined
  loading?: boolean
}>()

const eventTypeLabel = (type: ContainerEventType | string): string => {
  const key = `movements.types.${type.charAt(0).toLowerCase() + type.slice(1)}`
  return t(key)
}
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">{{ t('containers.lifecyclePage.totalEvents') }}</p>
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
        {{ eventTypeLabel(item.eventType) }}
      </div>
      <p class="text-2xl font-semibold">{{ item.count }}</p>
    </UCard>
  </div>
</template>
