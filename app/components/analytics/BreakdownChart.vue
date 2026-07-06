<script setup lang="ts">
import type { AnalyticsBreakdownItem } from '~/types'

const props = defineProps<{
  title: string
  icon?: string
  items?: AnalyticsBreakdownItem[]
  loading?: boolean
  colorClass?: string
}>()

const { t } = useI18n()

const maxCount = computed(() => {
  const values = props.items?.map(item => item.count) || []
  return Math.max(...values, 1)
})

const barClass = computed(() => props.colorClass || 'bg-primary-container')
</script>

<template>
  <div class="ds-card">
    <div class="ds-card-header flex items-center gap-2">
      <div v-if="icon" class="ds-icon-badge">
        <UIcon :name="icon" class="size-4 text-white" />
      </div>
      <h2 class="ds-section-title">{{ title }}</h2>
    </div>

    <div class="ds-card-body">
      <div v-if="loading" class="space-y-3">
        <USkeleton v-for="i in 4" :key="i" class="h-8 rounded-md" />
      </div>

      <AppEmptyState
        v-else-if="!items?.length"
        variant="compact"
        icon="i-lucide-chart-bar"
        :title="t('emptyState.charts.noData')"
      />

      <div v-else class="space-y-3">
        <div
          v-for="item in items"
          :key="item.label"
          class="space-y-1.5"
        >
          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="truncate ds-body-sm text-on-surface">{{ item.label }}</span>
            <span class="font-mono font-semibold tabular-nums text-on-surface">{{ item.count.toLocaleString() }}</span>
          </div>
          <div class="h-2 rounded-full bg-surface overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="barClass"
              :style="{ width: `${Math.max((item.count / maxCount) * 100, 4)}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
