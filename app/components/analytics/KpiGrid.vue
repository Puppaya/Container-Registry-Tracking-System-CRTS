<script setup lang="ts">
import type { AnalyticsOverview } from '~/types'

const props = defineProps<{
  overview?: AnalyticsOverview | null
  loading?: boolean
}>()

interface KpiItem {
  title: string
  value: number
  icon: string
  accent: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  to?: string
}

const accentIconClass: Record<string, string> = {
  primary: 'bg-primary-container',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-on-surface-variant'
}

const kpis = computed<KpiItem[]>(() => {
  const data = props.overview?.kpis

  return [
    {
      title: 'Total Containers',
      value: data?.totalContainers ?? 0,
      icon: 'i-lucide-container',
      accent: 'primary',
      to: '/containers'
    },
    {
      title: 'Active',
      value: data?.activeContainers ?? 0,
      icon: 'i-lucide-circle-check',
      accent: 'success',
      to: '/containers?status=Active'
    },
    {
      title: 'Not Surveyed',
      value: data?.notSurveyedContainers ?? 0,
      icon: 'i-lucide-clipboard-x',
      accent: 'warning',
      to: '/containers/search?surveyStatus=not_surveyed'
    },
    {
      title: 'Requiring Attention',
      value: data?.requiringAttention ?? 0,
      icon: 'i-lucide-triangle-alert',
      accent: 'danger',
      to: '/containers/search?status=Inactive'
    },
    {
      title: 'Recent Registrations (30d)',
      value: data?.recentRegistrations ?? 0,
      icon: 'i-lucide-calendar-plus',
      accent: 'primary'
    },
    {
      title: 'Lifecycle Events',
      value: data?.totalEvents ?? 0,
      icon: 'i-lucide-history',
      accent: 'primary',
      to: '/containers/lifecycle'
    },
    {
      title: 'Movements',
      value: data?.totalMovements ?? 0,
      icon: 'i-lucide-truck',
      accent: 'neutral',
      to: '/containers/movements'
    },
    {
      title: 'Survey Records',
      value: data?.totalSurveys ?? 0,
      icon: 'i-lucide-clipboard-list',
      accent: 'primary',
      to: '/survey/inspections'
    }
  ]
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <component
      :is="item.to ? 'NuxtLink' : 'div'"
      v-for="item in kpis"
      :key="item.title"
      :to="item.to"
      class="ds-kpi-card group block"
    >
      <div class="flex items-start justify-between gap-3 pl-2">
        <div class="ds-kpi-icon" :class="accentIconClass[item.accent]">
          <UIcon :name="item.icon" class="size-5 text-white" />
        </div>
      </div>

      <div class="mt-4 space-y-1 pl-2">
        <p class="ds-label text-xs">{{ item.title }}</p>
        <USkeleton v-if="loading" class="h-9 w-20 rounded-md" />
        <p v-else class="ds-metric">{{ item.value.toLocaleString() }}</p>
      </div>
    </component>
  </div>
</template>
