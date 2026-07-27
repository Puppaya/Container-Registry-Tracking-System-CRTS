<script setup lang="ts">
import type { AnalyticsEventBreakdownItem } from '~/types'

defineProps<{
  items?: AnalyticsEventBreakdownItem[]
  loading?: boolean
}>()

const { t } = useI18n()

const eventColors: Record<string, string> = {
  Registration: 'bg-primary-container',
  Survey: 'bg-primary',
  Repair: 'bg-warning',
  Maintenance: 'bg-on-surface-variant',
  Relocation: 'bg-primary-300',
  GateIn: 'bg-success',
  GateOut: 'bg-danger',
  StatusChange: 'bg-primary-200'
}
</script>

<template>
  <div class="ds-card">
    <div class="ds-card-header flex items-center gap-2">
      <div class="ds-icon-badge">
        <UIcon name="i-lucide-activity" class="size-4 text-white" />
      </div>
      <h2 class="ds-section-title">{{ t('analytics.charts.lifecycleByType') }}</h2>
    </div>

    <div class="ds-card-body">
      <div v-if="loading" class="space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-8 rounded-md" />
      </div>

      <AppEmptyState
        v-else-if="!items?.length"
        variant="compact"
        icon="i-lucide-activity"
        :title="t('analytics.empty.noLifecycle')"
      />

      <div v-else class="flex flex-wrap gap-2">
        <UBadge
          v-for="item in items"
          :key="item.eventType"
          color="neutral"
          variant="subtle"
          class="px-3 py-2 rounded-md"
        >
          <span class="inline-flex items-center gap-2">
            <span
              class="size-2 rounded-full"
              :class="eventColors[item.eventType] || 'bg-primary-container'"
            />
            <span class="font-medium font-display">{{ item.eventType }}</span>
            <span class="font-mono tabular-nums text-on-surface-variant">{{ item.count.toLocaleString() }}</span>
          </span>
        </UBadge>
      </div>
    </div>
  </div>
</template>
