<script setup lang="ts">
import type { DashboardSummary } from '~/types'
import { buildDashboardKpis } from '~/utils/dashboard-ui'

const { t } = useI18n()

const props = defineProps<{
  summary: DashboardSummary | null
  loading?: boolean
}>()

const kpis = computed(() => buildDashboardKpis(props.summary, t))

const accentIconClass: Record<string, string> = {
  primary: 'bg-primary-container',
  success: 'bg-success',
  warning: 'bg-warning',
  neutral: 'bg-on-surface-variant'
}

const trendClass = (tone: 'success' | 'error' | 'neutral') => ({
  'text-success': tone === 'success',
  'text-danger': tone === 'error',
  'text-on-surface-variant': tone === 'neutral'
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <component
      :is="kpi.to ? 'NuxtLink' : 'div'"
      v-for="kpi in kpis"
      :key="kpi.key"
      :to="kpi.to"
      class="ds-kpi-card group block"
    >
      <div class="flex items-start justify-between gap-3 pl-2">
        <div
          class="ds-kpi-icon"
          :class="accentIconClass[kpi.accent || 'primary']"
        >
          <UIcon :name="kpi.icon" class="size-5 text-white" />
        </div>

        <div
          v-if="kpi.trend"
          class="flex items-center gap-0.5 font-mono text-xs font-medium tabular-nums"
          :class="trendClass(kpi.trend.tone)"
        >
          <UIcon
            v-if="kpi.trend.direction === 'up'"
            name="i-lucide-trending-up"
            class="size-3.5"
          />
          <UIcon
            v-else-if="kpi.trend.direction === 'down'"
            name="i-lucide-trending-down"
            class="size-3.5"
          />
          {{ kpi.trend.value }}
        </div>
      </div>

      <div class="mt-4 space-y-1 pl-2">
        <p class="ds-label text-xs">
          {{ kpi.label }}
        </p>
        <USkeleton v-if="loading" class="h-9 w-24 rounded-md" />
        <p v-else class="ds-metric">
          {{ kpi.value }}
        </p>
        <p v-if="kpi.sublabel" class="ds-body-sm">
          {{ kpi.sublabel }}
        </p>
      </div>
    </component>
  </div>
</template>
