<script setup lang="ts">
import type { DashboardActivity } from '~/types'
import { formatEventDate } from '~/utils/container-events'

const props = defineProps<{
  activities: DashboardActivity[]
  loading?: boolean
}>()

const columns = [
  { accessorKey: 'eventType', header: 'Event Type' },
  { accessorKey: 'eventDescription', header: 'Description' },
  { accessorKey: 'eventDate', header: 'Date' }
]

const tableRows = computed(() =>
  props.activities.map(activity => ({
    eventId: activity.eventId,
    containerId: activity.containerId,
    containerNumber: activity.containerNumber,
    eventType: activity.eventType,
    eventDescription: activity.eventDescription || '—',
    eventDate: activity.eventDate
  }))
)
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-activity" class="size-5 text-muted" />
          <h2 class="font-semibold">Recent Activities</h2>
        </div>
        <UBadge color="neutral" variant="subtle">
          {{ activities.length }} events
        </UBadge>
      </div>
    </template>

    <UTable
      :data="tableRows"
      :columns="columns"
      :loading="loading"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2.5 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default align-top'
      }"
    >
      <template #eventType-cell="{ row }">
        <div class="space-y-1">
          <UBadge color="neutral" variant="subtle" size="sm">
            {{ row.original.eventType }}
          </UBadge>
          <NuxtLink
            :to="`/containers/${row.original.containerId}`"
            class="block font-mono text-xs text-primary hover:underline"
          >
            {{ row.original.containerNumber }}
          </NuxtLink>
        </div>
      </template>

      <template #eventDescription-cell="{ row }">
        <span class="text-sm text-default">{{ row.original.eventDescription }}</span>
      </template>

      <template #eventDate-cell="{ row }">
        <span class="text-sm text-muted whitespace-nowrap">
          {{ formatEventDate(row.original.eventDate) }}
        </span>
      </template>
    </UTable>

    <AppEmptyState
      v-if="!loading && tableRows.length === 0"
      variant="inline"
      icon="i-lucide-activity"
      :title="$t('dashboard.activity.emptyActivities')"
    />
  </UCard>
</template>
