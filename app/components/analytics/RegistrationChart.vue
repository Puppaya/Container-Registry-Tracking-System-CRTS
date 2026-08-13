<script setup lang="ts">
import type { AnalyticsBreakdownItem } from '~/types'

const props = defineProps<{
  items?: AnalyticsBreakdownItem[]
  loading?: boolean
}>()

const { t } = useI18n()

const maxCount = computed(() => {
  const trend = props.items || []
  return Math.max(...trend.map(item => item.count), 1)
})
</script>

<template>
  <div class="ds-card">
    <div class="ds-card-header flex items-center gap-2">
      <div class="ds-icon-badge">
        <UIcon name="i-lucide-chart-column" class="size-4 text-white" />
      </div>
      <h2 class="ds-section-title">Registration Trend (6 months)</h2>
    </div>

    <div class="ds-card-body">
      <div v-if="loading" class="space-y-3">
        <USkeleton v-for="i in 6" :key="i" class="h-8 rounded-md" />
      </div>

      <AppEmptyState
        v-else-if="!items?.length"
        variant="compact"
        icon="i-lucide-chart-column"
        :title="t('analytics.empty.noRegistration')"
      />

      <div v-else class="grid grid-cols-3 sm:grid-cols-6 gap-3 items-end min-h-48">
        <div
          v-for="item in items"
          :key="item.label"
          class="group flex flex-col items-center gap-2"
        >
          <span class="font-mono text-xs font-semibold tabular-nums text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            {{ item.count }}
          </span>
          <div
            class="ds-chart-bar w-full"
            :style="{ height: `${Math.max((item.count / maxCount) * 120, 4)}px` }"
          />
          <span class="font-mono text-xs text-on-surface-variant text-center">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
