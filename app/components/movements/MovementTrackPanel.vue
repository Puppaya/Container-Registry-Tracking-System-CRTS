<script setup lang="ts">
import type { MovementTrackResult } from '~/types'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, formatEventDate } from '~/utils/container-events'
import { getMovementStatusHint } from '~/utils/movements'

const trackQuery = defineModel<string>('trackQuery', { default: '' })

const emit = defineEmits<{
  track: []
}>()

defineProps<{
  result: MovementTrackResult | null | undefined
  loading?: boolean
  error?: boolean
}>()
</script>

<template>
  <UCard>
    <div class="flex flex-wrap items-end gap-3">
      <UFormField label="Track Container" class="min-w-80 flex-1">
        <UInput
          v-model="trackQuery"
          icon="i-lucide-locate-fixed"
          placeholder="Container number or prefix..."
          @keyup.enter="emit('track')"
        />
      </UFormField>
      <UButton
        label="Track"
        icon="i-lucide-radar"
        :loading="loading"
        @click="emit('track')"
      />
    </div>

    <div v-if="loading" class="flex justify-center py-8 mt-4">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
    </div>

    <UAlert
      v-else-if="error"
      class="mt-4"
      color="warning"
      icon="i-lucide-search-x"
      title="Container not found"
      description="Try a full container number or a unique prefix."
    />

    <div v-else-if="result" class="mt-6 space-y-4">
      <div class="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-default bg-elevated/30 p-4">
        <div>
          <p class="text-sm text-muted">Tracking Result</p>
          <p class="text-xl font-mono font-semibold">{{ result.container.containerNumber }}</p>
          <p class="text-sm text-muted mt-1">
            {{ result.container.isoType }} · {{ result.container.containerSize }}ft · {{ result.container.owner }}
          </p>
        </div>
        <div class="text-right">
          <ContainersContainerStatusBadge :status="result.container.status as any" />
          <p class="text-xs text-muted mt-2">
            {{ getMovementStatusHint(result.latestMovement?.eventType) }}
          </p>
        </div>
      </div>

      <div v-if="result.latestMovement" class="rounded-lg border border-default p-4">
        <p class="text-sm text-muted mb-2">Latest Movement</p>
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            :color="EVENT_TYPE_COLORS[result.latestMovement.eventType]"
            variant="subtle"
          >
            {{ EVENT_TYPE_LABELS[result.latestMovement.eventType] }}
          </UBadge>
          <span class="text-sm">{{ formatEventDate(result.latestMovement.eventDate) }}</span>
        </div>
        <p v-if="result.latestMovement.eventDescription" class="text-sm mt-2">
          {{ result.latestMovement.eventDescription }}
        </p>
      </div>

      <div v-if="result.recentMovements.length > 0">
        <p class="text-sm font-medium mb-2">Recent Movements</p>
        <ul class="space-y-2">
          <li
            v-for="movement in result.recentMovements"
            :key="movement.eventId"
            class="flex items-center justify-between gap-3 rounded-lg border border-default px-3 py-2 text-sm"
          >
            <div class="flex items-center gap-2">
              <UBadge :color="EVENT_TYPE_COLORS[movement.eventType]" variant="subtle" size="sm">
                {{ EVENT_TYPE_LABELS[movement.eventType] }}
              </UBadge>
              <span class="text-muted">{{ movement.eventDescription || '—' }}</span>
            </div>
            <span class="text-xs text-muted shrink-0">{{ formatEventDate(movement.eventDate) }}</span>
          </li>
        </ul>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          label="View Profile"
          icon="i-lucide-container"
          variant="outline"
          :to="`/containers/${result.container.containerId}`"
        />
        <UButton
          label="Movement History"
          icon="i-lucide-truck"
          variant="ghost"
          :to="`/containers/${result.container.containerId}/movements`"
        />
      </div>
    </div>
  </UCard>
</template>
