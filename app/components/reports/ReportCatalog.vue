<script setup lang="ts">
import { REPORTS, type ReportKey } from '~/utils/reports'

defineProps<{
  activeReport: ReportKey
}>()

const emit = defineEmits<{
  select: [key: ReportKey]
}>()
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
      <div class="font-display font-semibold text-on-surface">{{ report.title }}</div>
      <p class="mt-1 ds-body-sm">{{ report.description }}</p>
    </button>
  </div>
</template>
