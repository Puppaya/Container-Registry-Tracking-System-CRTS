<script setup lang="ts">
import type { DashboardSummary } from '~/types'

const props = defineProps<{
  summary: DashboardSummary | null
  loading?: boolean
}>()

interface StatWidget {
  title: string
  value: number
  icon: string
  color: string
  to: string
}

const widgets = computed<StatWidget[]>(() => {
  const data = props.summary

  return [
    {
      title: 'Total Containers',
      value: data?.totalContainers ?? 0,
      icon: 'i-lucide-container',
      color: 'text-primary',
      to: '/containers'
    },
    {
      title: 'Active Containers',
      value: data?.activeContainers ?? 0,
      icon: 'i-lucide-circle-check',
      color: 'text-success',
      to: '/containers?status=Active'
    },
    {
      title: 'Inactive Containers',
      value: data?.inactiveContainers ?? 0,
      icon: 'i-lucide-circle-off',
      color: 'text-neutral',
      to: '/containers?status=Inactive'
    },
    {
      title: 'Surveyed Containers',
      value: data?.surveyedContainers ?? 0,
      icon: 'i-lucide-clipboard-check',
      color: 'text-info',
      to: '/containers/search?surveyStatus=surveyed'
    },
    {
      title: 'Containers Requiring Attention',
      value: data?.requiringAttention ?? 0,
      icon: 'i-lucide-triangle-alert',
      color: 'text-warning',
      to: '/containers/search?status=Inactive'
    }
  ]
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
    <UCard
      v-for="widget in widgets"
      :key="widget.title"
      class="hover:ring-1 hover:ring-primary/20 transition-shadow"
    >
      <NuxtLink :to="widget.to" class="block space-y-3">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-medium uppercase tracking-wide text-muted">
            {{ widget.title }}
          </p>
          <div class="rounded-full bg-elevated p-2">
            <UIcon :name="widget.icon" :class="['size-4', widget.color]" />
          </div>
        </div>

        <USkeleton v-if="loading" class="h-9 w-20" />
        <p v-else class="text-3xl font-semibold text-highlighted tabular-nums">
          {{ widget.value.toLocaleString() }}
        </p>
      </NuxtLink>
    </UCard>
  </div>
</template>
