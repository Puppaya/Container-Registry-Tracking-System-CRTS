<script setup lang="ts">
import type { PublicContainerTrackResponse } from '~/types'
import { EVENT_TYPE_ICONS, EVENT_TYPE_LABELS, formatEventDate } from '~/utils/container-events'
import { getSurveyResultColor } from '~/utils/survey-inspection'

defineProps<{
  data: PublicContainerTrackResponse
}>()

const { t } = useI18n()

function statusLabel(status: string) {
  if (status === 'Pending') return t('public.statusPending')
  if (status === 'Inactive') return t('public.statusInactive')
  return t('public.statusActive')
}

function statusColor(status: string) {
  if (status === 'Pending') return 'warning'
  if (status === 'Inactive') return 'neutral'
  return 'success'
}
</script>

<template>
  <div class="w-full min-w-0 space-y-4 sm:space-y-5">
    <UCard class="w-full">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <p class="text-[11px] sm:text-xs uppercase tracking-wide text-muted">{{ t('public.fullNumber') }}</p>
          <h1 class="mt-1 font-mono text-xl sm:text-2xl font-bold break-all leading-tight">
            {{ data.container.containerNumber }}
          </h1>
          <div class="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs sm:text-sm text-muted">
            <span class="inline-flex items-center rounded-md bg-elevated/60 px-2 py-0.5">{{ data.container.isoType }}</span>
            <span class="inline-flex items-center rounded-md bg-elevated/60 px-2 py-0.5">{{ data.container.containerSize }}ft</span>
            <span class="inline-flex items-center rounded-md bg-elevated/60 px-2 py-0.5">{{ data.container.containerCategory }}</span>
            <span class="inline-flex items-center rounded-md bg-elevated/60 px-2 py-0.5 max-w-full truncate">{{ data.container.owner }}</span>
          </div>
          <p v-if="data.registrationReference" class="mt-3 text-xs sm:text-sm break-all">
            <span class="text-muted">{{ t('public.referenceNo') }}:</span>
            <span class="font-mono font-medium ms-1">{{ data.registrationReference }}</span>
          </p>
        </div>
        <UBadge
          :color="statusColor(data.container.status)"
          variant="subtle"
          size="lg"
          class="self-start shrink-0"
        >
          {{ statusLabel(data.container.status) }}
        </UBadge>
      </div>

      <UAlert
        v-if="data.container.status === 'Pending'"
        class="mt-4"
        color="warning"
        icon="i-lucide-clock"
        :title="t('public.statusPending')"
        :description="t('public.pendingNote')"
      />
    </UCard>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      <UCard class="w-full">
        <template #header>
          <div class="flex items-center gap-2 text-sm sm:text-base font-semibold">
            <UIcon name="i-lucide-activity" class="size-4 shrink-0" />
            {{ t('public.currentStatus') }}
          </div>
        </template>
        <dl class="space-y-3 text-sm">
          <div>
            <dt class="text-muted">{{ t('public.location') }}</dt>
            <dd class="font-medium break-words">{{ data.currentStatus.currentLocation || '—' }}</dd>
          </div>
          <div v-if="data.currentStatus.lastUpdated">
            <dt class="text-muted">Updated</dt>
            <dd>{{ formatEventDate(data.currentStatus.lastUpdated) }}</dd>
          </div>
        </dl>
      </UCard>

      <UCard class="w-full">
        <template #header>
          <div class="flex items-center gap-2 text-sm sm:text-base font-semibold">
            <UIcon name="i-lucide-search-check" class="size-4 shrink-0" />
            {{ t('public.latestSurvey') }}
          </div>
        </template>
        <AppEmptyState
          v-if="!data.latestSurvey"
          icon="i-lucide-search-check"
          :title="t('public.noSurvey')"
        />
        <dl v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-muted">Survey Date</dt>
            <dd class="font-medium">{{ formatEventDate(data.latestSurvey.surveyDate) }}</dd>
          </div>
          <div>
            <dt class="text-muted">Result</dt>
            <dd class="mt-1 sm:mt-0">
              <UBadge :color="getSurveyResultColor(data.latestSurvey.result)" variant="subtle">
                {{ data.latestSurvey.result }}
              </UBadge>
            </dd>
          </div>
        </dl>
      </UCard>

      <UCard class="w-full md:col-span-2 lg:col-span-1">
        <template #header>
          <div class="flex items-center gap-2 text-sm sm:text-base font-semibold">
            <UIcon name="i-lucide-truck" class="size-4 shrink-0" />
            {{ t('public.recentMovements') }}
          </div>
        </template>
        <ContainersProfileContainerMovementSummary :movements="data.recentMovements as any" />
      </UCard>

      <UCard class="w-full md:col-span-2">
        <template #header>
          <div class="flex items-center gap-2 text-sm sm:text-base font-semibold">
            <UIcon name="i-lucide-history" class="size-4 shrink-0" />
            {{ t('public.timeline') }}
          </div>
        </template>

        <AppEmptyState
          v-if="data.timeline.length === 0"
          icon="i-lucide-history"
          :title="t('public.noTimeline')"
        />

        <ol v-else class="relative border-s border-default ms-2 sm:ms-3 space-y-4 sm:space-y-5">
          <li
            v-for="(event, index) in data.timeline"
            :key="`${event.eventType}-${event.eventDate}-${index}`"
            class="ms-5 sm:ms-6"
          >
            <span class="absolute -start-2.5 sm:-start-3 flex size-5 sm:size-6 items-center justify-center rounded-full bg-elevated ring-4 ring-[var(--ui-bg)]">
              <UIcon :name="EVENT_TYPE_ICONS[event.eventType as keyof typeof EVENT_TYPE_ICONS] || 'i-lucide-circle'" class="size-3 sm:size-3.5 text-muted" />
            </span>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
              <div class="min-w-0">
                <p class="text-sm font-medium">
                  {{ EVENT_TYPE_LABELS[event.eventType as keyof typeof EVENT_TYPE_LABELS] || event.eventType }}
                </p>
                <p v-if="event.eventDescription" class="text-sm text-muted mt-0.5 break-words">
                  {{ event.eventDescription }}
                </p>
              </div>
              <span class="text-xs text-muted shrink-0">{{ formatEventDate(event.eventDate) }}</span>
            </div>
          </li>
        </ol>
      </UCard>
    </div>
  </div>
</template>
