<script setup lang="ts">
import type { ContainerCurrentStatus } from '~/types'
import { EVENT_TYPE_LABELS, formatEventDate } from '~/utils/container-events'
import { getMovementStatusHint } from '~/utils/movements'

defineProps<{
  currentStatus: ContainerCurrentStatus
  eventCount: number
}>()

const LOCATION_SOURCE_LABELS: Record<ContainerCurrentStatus['locationSource'], string> = {
  movement: 'From latest movement',
  registry: 'From registry location',
  unknown: 'No location recorded'
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <ContainersContainerStatusBadge :status="currentStatus.operationalStatus" />
      <div class="flex items-center gap-2 ds-body-sm">
        <UIcon name="i-lucide-history" class="size-4 text-on-surface-variant" />
        <span class="font-mono">{{ eventCount }} lifecycle event(s)</span>
      </div>
    </div>

    <div class="rounded-lg border border-default bg-surface-container-low/40 p-4">
      <p class="ds-field-label">Current Location</p>
      <div class="mt-1 flex items-start gap-2">
        <UIcon name="i-lucide-map-pin" class="size-4 shrink-0 mt-0.5 text-primary-container" />
        <p class="ds-field-value text-base">
          {{ currentStatus.currentLocation || '—' }}
        </p>
      </div>
      <p class="mt-2 ds-body-sm text-muted">
        {{ LOCATION_SOURCE_LABELS[currentStatus.locationSource] }}
      </p>
    </div>

    <div v-if="currentStatus.lastMovementType" class="flex flex-wrap items-center gap-x-4 gap-y-1 ds-body-sm">
      <span class="inline-flex items-center gap-1.5">
        <UIcon name="i-lucide-truck" class="size-4 text-on-surface-variant" />
        {{ EVENT_TYPE_LABELS[currentStatus.lastMovementType] }}
        · {{ getMovementStatusHint(currentStatus.lastMovementType) }}
      </span>
      <span v-if="currentStatus.lastUpdated" class="text-muted">
        {{ formatEventDate(currentStatus.lastUpdated) }}
      </span>
    </div>

    <p v-else-if="currentStatus.operationalStatus === 'Active'" class="ds-body-sm text-success font-medium">
      ພ້ອມໃຊ້ງານປົກກະຕິ
    </p>
    <p v-else class="ds-body-sm">
      ຢຸດໃຊ້ງານ / ບໍ່ເຄື່ອນไหว
    </p>
  </div>
</template>
