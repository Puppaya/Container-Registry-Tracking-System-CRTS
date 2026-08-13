<script setup lang="ts">
import type { LifecycleEvent } from '~/types'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, formatEventDate } from '~/utils/container-events'

defineProps<{
  events: LifecycleEvent[]
  loading?: boolean
  showContainer?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div>
    <AppEmptyState
      v-if="!loading && events.length === 0"
      variant="inline"
      icon="i-lucide-history"
      :title="t('emptyState.lifecycle.title')"
      :description="t('emptyState.lifecycle.description')"
    />
    <UTable
      v-else
      :data="events"
      :loading="loading"
      :columns="[
        { accessorKey: 'eventDate', header: 'Date' },
        ...(showContainer ? [{ accessorKey: 'containerNumber', header: 'Container' }] : []),
        { accessorKey: 'eventType', header: 'Event' },
        { accessorKey: 'eventDescription', header: 'Description' },
        { accessorKey: 'createdBy', header: 'Recorded By' },
        { id: 'actions', header: '' }
      ]"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
        separator: 'h-0'
      }"
    >
      <template #eventDate-cell="{ row }">
        {{ formatEventDate((row.original as unknown as LifecycleEvent).eventDate) }}
      </template>

      <template #containerNumber-cell="{ row }">
        <NuxtLink
          v-if="(row.original as unknown as LifecycleEvent).containerNumber"
          :to="`/containers/${(row.original as unknown as LifecycleEvent).containerId}`"
          class="font-mono text-primary hover:underline"
        >
          {{ (row.original as unknown as LifecycleEvent).containerNumber }}
        </NuxtLink>
        <span v-else>—</span>
      </template>

      <template #eventType-cell="{ row }">
        <UBadge
          :color="EVENT_TYPE_COLORS[(row.original as unknown as LifecycleEvent).eventType]"
          variant="subtle"
          size="sm"
        >
          {{ EVENT_TYPE_LABELS[(row.original as unknown as LifecycleEvent).eventType] }}
        </UBadge>
      </template>

      <template #eventDescription-cell="{ row }">
        {{ (row.original as unknown as LifecycleEvent).eventDescription || '—' }}
      </template>

      <template #actions-cell="{ row }">
        <UButton
          v-if="showContainer"
          icon="i-lucide-external-link"
          color="neutral"
          variant="ghost"
          size="sm"
          :to="`/containers/${(row.original as unknown as LifecycleEvent).containerId}/lifecycle`"
        />
      </template>
    </UTable>
  </div>
</template>
