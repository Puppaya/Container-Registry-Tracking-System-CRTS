<script setup lang="ts">
import type { ContainerEvent } from '~/types'
import { EVENT_TYPE_LABELS, formatEventDate } from '~/utils/container-events'

defineProps<{
  movements: ContainerEvent[]
}>()

const { t } = useI18n()
</script>

<template>
  <AppEmptyState
    v-if="movements.length === 0"
    icon="i-lucide-truck"
    :title="t('containers.movementsEmpty')"
  />

  <ul v-else class="divide-y divide-default">
    <li
      v-for="movement in movements"
      :key="movement.eventId"
      class="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
    >
      <div>
        <p class="text-sm font-medium">{{ EVENT_TYPE_LABELS[movement.eventType] }}</p>
        <p v-if="movement.eventDescription" class="text-sm text-muted mt-0.5">
          {{ movement.eventDescription }}
        </p>
      </div>
      <span class="text-xs text-muted shrink-0">{{ formatEventDate(movement.eventDate) }}</span>
    </li>
  </ul>
</template>
