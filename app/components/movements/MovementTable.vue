<script setup lang="ts">
import type { MovementEvent } from '~/types'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, formatEventDate } from '~/utils/container-events'

defineProps<{
  events: MovementEvent[]
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
      icon="i-lucide-truck"
      :title="t('emptyState.movements.title')"
      :description="t('emptyState.movements.description')"
    />
    <UTable
      v-else
      :data="events"
      :loading="loading"
      :columns="[
        { accessorKey: 'eventDate', header: 'Date' },
        ...(showContainer ? [{ accessorKey: 'containerNumber', header: 'Container' }] : []),
        { accessorKey: 'eventType', header: 'Movement' },
        { accessorKey: 'eventDescription', header: 'Location / Details' },
        { accessorKey: 'containerOwner', header: 'Owner' },
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
        {{ formatEventDate((row.original as unknown as MovementEvent).eventDate) }}
      </template>

      <template #containerNumber-cell="{ row }">
        <NuxtLink
          v-if="(row.original as unknown as MovementEvent).containerNumber"
          :to="`/containers/${(row.original as unknown as MovementEvent).containerId}/movements`"
          class="font-mono text-primary hover:underline"
        >
          {{ (row.original as unknown as MovementEvent).containerNumber }}
        </NuxtLink>
        <span v-else>—</span>
      </template>

      <template #eventType-cell="{ row }">
        <UBadge
          :color="EVENT_TYPE_COLORS[(row.original as unknown as MovementEvent).eventType]"
          variant="subtle"
          size="sm"
        >
          {{ EVENT_TYPE_LABELS[(row.original as unknown as MovementEvent).eventType] }}
        </UBadge>
      </template>

      <template #eventDescription-cell="{ row }">
        {{ (row.original as unknown as MovementEvent).eventDescription || '—' }}
      </template>

      <template #containerOwner-cell="{ row }">
        {{ (row.original as unknown as MovementEvent).containerOwner || '—' }}
      </template>

      <template #actions-cell="{ row }">
        <UButton
          icon="i-lucide-locate-fixed"
          color="neutral"
          variant="ghost"
          size="sm"
          :to="`/containers/${(row.original as unknown as MovementEvent).containerId}`"
        />
      </template>
    </UTable>
  </div>
</template>
