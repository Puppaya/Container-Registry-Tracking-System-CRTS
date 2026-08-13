<script setup lang="ts">
import { REPORTS, type ReportKey } from '~/utils/reports'

const { t } = useI18n()

defineProps<{
  activeReport: ReportKey
}>()

const emit = defineEmits<{
  select: [key: ReportKey]
}>()

const reportKeyToi18n: Record<string, string> = {
  'registry': 'reports.registry',
  'lifecycle': 'reports.lifecycle',
  'survey-coverage': 'reports.surveyCoverage',
  'status-summary': 'reports.statusSummary'
}
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <button
      v-for="report in REPORTS"
      :key="report.key"
      type="button"
      class="ds-report-tile"
      :class="{ 'ds-report-tile--active': activeReport === report.key }"
      @click="emit('select', report.key)"
    >
      <div class="font-display font-semibold text-on-surface">{{ t(reportKeyToi18n[report.key] + '.title') }}</div>
      <p class="mt-1 ds-body-sm">{{ t(reportKeyToi18n[report.key] + '.desc') }}</p>
    </button>
  </div>
</template>
