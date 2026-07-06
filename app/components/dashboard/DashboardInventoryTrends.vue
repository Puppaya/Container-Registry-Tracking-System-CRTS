<script setup lang="ts">
import type { DashboardSummary } from '~/types'

const props = defineProps<{
  summary?: DashboardSummary | null
  loading?: boolean
}>()

const { t } = useI18n()

type TrendMode = 'volume' | 'throughput'

const mode = ref<TrendMode>('volume')

const chartItems = computed(() => {
  if (mode.value === 'volume') {
    return props.summary?.registrationTrend ?? []
  }

  return (props.summary?.statusBreakdown ?? []).map(item => ({
    label: item.status,
    count: item.count
  }))
})

const maxCount = computed(() => {
  const values = chartItems.value.map(item => item.count)
  return Math.max(...values, 1)
})
</script>

<template>
  <div class="ds-card flex h-full flex-col">
    <div class="ds-card-header flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="font-display text-base font-semibold text-on-surface">
          Inventory Trends
        </h2>
        <p class="ds-body-sm mt-0.5">
          {{ mode === 'volume' ? 'Registration volume — last 6 months' : 'Fleet status throughput' }}
        </p>
      </div>

      <div class="inline-flex rounded-md border border-[#e4e2ef] p-0.5 bg-surface">
        <button
          type="button"
          class="rounded-sm px-3 py-1.5 font-mono text-xs font-medium transition-colors"
          :class="mode === 'volume'
            ? 'bg-primary-container text-white shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface'"
          @click="mode = 'volume'"
        >
          Volume
        </button>
        <button
          type="button"
          class="rounded-sm px-3 py-1.5 font-mono text-xs font-medium transition-colors"
          :class="mode === 'throughput'
            ? 'bg-primary-container text-white shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface'"
          @click="mode = 'throughput'"
        >
          Throughput
        </button>
      </div>
    </div>

    <div class="flex-1 p-4 lg:p-6">
      <div v-if="loading" class="grid grid-cols-6 gap-3">
        <USkeleton v-for="i in 6" :key="i" class="h-32 rounded-md" />
      </div>

      <AppEmptyState
        v-else-if="!chartItems.length"
        variant="compact"
        icon="i-lucide-chart-column"
        :title="t('dashboard.inventoryTrends.empty')"
      />

      <div v-else class="flex h-48 items-end gap-2 sm:gap-3">
        <div
          v-for="(item, index) in chartItems"
          :key="item.label"
          class="group flex flex-1 flex-col items-center gap-2 min-w-0"
        >
          <span class="font-mono text-xs font-semibold tabular-nums text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            {{ item.count }}
          </span>
          <div
            class="ds-chart-bar w-full max-w-12"
            :style="{
              height: `${Math.max((item.count / maxCount) * 140, 6)}px`,
              opacity: 0.55 + (index / Math.max(chartItems.length - 1, 1)) * 0.45
            }"
          />
          <span class="w-full truncate text-center font-mono text-[10px] sm:text-xs text-on-surface-variant">
            {{ item.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
