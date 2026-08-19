<script setup lang="ts">
import type { LifecycleEvent } from '~/types'
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_ICONS,
  EVENT_TYPE_LABELS,
  formatEventDate
} from '~/utils/container-events'

const props = defineProps<{
  containerId: number
  canWrite?: boolean
  eventType?: string
  dateFrom?: string
  dateTo?: string
}>()

const { data: timeline, refresh, pending } = useApi<{
  container: { containerNumber: string }
  events: LifecycleEvent[]
}>(() => {
  const params = new URLSearchParams()
  if (props.eventType && props.eventType !== 'all') params.set('eventType', props.eventType)
  if (props.dateFrom) params.set('dateFrom', props.dateFrom)
  if (props.dateTo) params.set('dateTo', props.dateTo)
  const qs = params.toString()
  return `/api/containers/${props.containerId}/timeline${qs ? `?${qs}` : ''}`
}, {
  key: () => `container-timeline-${props.containerId}-${props.eventType || 'all'}-${props.dateFrom || ''}-${props.dateTo || ''}`
})

const events = computed(() => timeline.value?.data?.events || [])

const { t } = useI18n()

defineExpose({ refresh })
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold text-highlighted">Lifecycle Timeline</h3>
        <p class="text-sm text-muted">{{ events.length }} event(s)</p>
      </div>
      <UButton
        v-if="canWrite"
        label="Add Event"
        icon="i-lucide-plus"
        size="sm"
        variant="outline"
        :to="`/containers/${containerId}/events/create`"
      />
    </div>

    <div v-if="pending" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
    </div>

    <AppEmptyState
      v-else-if="events.length === 0"
      icon="i-lucide-history"
      :title="t('containers.timeline.empty')"
      :action-label="canWrite ? t('containers.addEvent') : undefined"
      :action-to="canWrite ? `/containers/${containerId}/events/create` : undefined"
      action-icon="i-lucide-plus"
    />

    <ol v-else class="relative border-s border-default ms-3 space-y-6">
      <li
        v-for="event in events"
        :key="event.eventId"
        class="ms-6"
      >
        <span
          class="absolute -start-3 flex size-6 items-center justify-center rounded-full bg-elevated ring-4 ring-default"
        >
          <UIcon
            :name="EVENT_TYPE_ICONS[event.eventType]"
            class="size-3.5 text-muted"
          />
        </span>

        <div class="rounded-lg border border-default bg-elevated/30 p-4">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <UBadge
              :color="EVENT_TYPE_COLORS[event.eventType]"
              variant="subtle"
              size="sm"
            >
              {{ EVENT_TYPE_LABELS[event.eventType] }}
            </UBadge>
            <span class="text-xs text-muted">{{ formatEventDate(event.eventDate) }}</span>
          </div>

          <p v-if="event.eventDescription" class="text-sm text-highlighted">
            {{ event.eventDescription }}
          </p>

          <p class="text-xs text-muted mt-2">
            Recorded by {{ event.createdBy }}
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>
