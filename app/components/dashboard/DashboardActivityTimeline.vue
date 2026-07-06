<script setup lang="ts">
import type { DashboardActivity } from '~/types'
import {
  formatTimelineGroup,
  formatTimelineTime,
  getActivityTimelineColor
} from '~/utils/dashboard-ui'
import { EVENT_TYPE_LABELS } from '~/utils/container-events'

const { t, locale } = useI18n()

const props = defineProps<{
  activities: DashboardActivity[]
  loading?: boolean
}>()

interface TimelineEntry {
  key: string
  group: string
  time: string
  activity: DashboardActivity
}

const timelineEntries = computed<TimelineEntry[]>(() =>
  props.activities.map(activity => ({
    key: `${activity.eventId}`,
    group: formatTimelineGroup(activity.eventDate, t, locale.value),
    time: formatTimelineTime(activity.eventDate),
    activity
  }))
)

const groupedEntries = computed(() => {
  const groups = new Map<string, TimelineEntry[]>()

  for (const entry of timelineEntries.value) {
    const list = groups.get(entry.group) ?? []
    list.push(entry)
    groups.set(entry.group, list)
  }

  return Array.from(groups.entries())
})
</script>

<template>
  <div class="ds-card overflow-hidden">
    <div class="ds-card-header flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="ds-kpi-icon">
          <UIcon name="i-lucide-history" class="size-5 text-white" />
        </div>
        <div>
          <h2 class="font-display text-base font-semibold text-on-surface">
            {{ $t('dashboard.activity.title') }}
          </h2>
          <p class="ds-body-sm mt-0.5">
            {{ $t('dashboard.activity.subtitle') }}
          </p>
        </div>
      </div>

      <UButton
        :label="$t('dashboard.activity.viewLifecycle')"
        icon="i-lucide-arrow-right"
        size="xs"
        color="primary"
        variant="outline"
        to="/containers/lifecycle"
      />
    </div>

    <div v-if="loading" class="space-y-4 p-4 lg:p-6">
      <USkeleton v-for="i in 4" :key="i" class="h-16 rounded-md" />
    </div>

    <div v-else-if="!timelineEntries.length" class="py-4">
      <AppEmptyState
        variant="compact"
        icon="i-lucide-history"
        :title="$t('dashboard.activity.empty')"
      />
    </div>

    <div v-else class="p-4 lg:p-6">
      <div
        v-for="[group, entries] in groupedEntries"
        :key="group"
        class="mb-8 last:mb-0"
      >
        <p class="mb-4 font-mono text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
          {{ group }}
        </p>

        <div class="relative space-y-0">
          <div
            v-for="(entry, index) in entries"
            :key="entry.key"
            class="relative flex gap-4 pb-6 last:pb-0"
          >
            <div class="relative flex flex-col items-center">
              <span
                class="relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-surface-container-low"
                :class="getActivityTimelineColor(entry.activity.eventType)"
              />
              <span
                v-if="index < entries.length - 1"
                class="absolute top-4 h-full w-px bg-[#e4e2ef]"
              />
            </div>

            <div class="min-w-0 flex-1 pt-0.5">
              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span class="font-mono text-xs font-medium tabular-nums text-on-surface-variant">
                  {{ entry.time }}
                </span>
                <UBadge color="primary" variant="subtle" size="sm" class="font-mono">
                  {{ EVENT_TYPE_LABELS[entry.activity.eventType] || entry.activity.eventType }}
                </UBadge>
              </div>

              <p class="mt-1 text-sm font-medium text-on-surface">
                <NuxtLink
                  :to="`/containers/${entry.activity.containerId}`"
                  class="font-mono text-primary-container hover:text-primary hover:underline"
                >
                  {{ entry.activity.containerNumber }}
                </NuxtLink>
                <span v-if="entry.activity.eventDescription" class="font-normal ds-body-sm">
                  — {{ entry.activity.eventDescription }}
                </span>
              </p>

              <p class="mt-1 font-mono text-xs text-on-surface-variant">
                {{ $t('dashboard.activity.operator', { name: entry.activity.createdBy }) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
