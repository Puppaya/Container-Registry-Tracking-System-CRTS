<script setup lang="ts">
import type { ReportFilters } from '~/composables/useReports'
import type { ReportKey } from '~/utils/reports'

const { t } = useI18n()

defineProps<{
  filters: ReportFilters
  activeReport: ReportKey
}>()
</script>

<template>
  <div
    v-if="activeReport === 'registry' || activeReport === 'lifecycle'"
    class="grid gap-4 md:grid-cols-3"
  >
    <UFormField v-if="activeReport === 'registry'" :label="t('reports.filters.status')">
      <USelect
        v-model="filters.status"
        :items="[
          { label: t('common.all'), value: 'all' },
          { label: t('common.active'), value: 'Active' },
          { label: t('common.inactive'), value: 'Inactive' }
        ]"
      />
    </UFormField>

    <UFormField :label="t('reports.filters.dateFrom')">
      <AppDateInput v-model="filters.dateFrom" />
    </UFormField>

    <UFormField :label="t('reports.filters.dateTo')">
      <AppDateInput v-model="filters.dateTo" />
    </UFormField>
  </div>
</template>
