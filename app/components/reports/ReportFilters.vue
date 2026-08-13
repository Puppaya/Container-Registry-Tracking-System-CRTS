<script setup lang="ts">
import type { ReportFilters } from '~/composables/useReports'
import type { ReportKey } from '~/utils/reports'

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
    <UFormField v-if="activeReport === 'registry'" label="Status">
      <USelect
        v-model="filters.status"
        :items="[
          { label: 'All', value: 'all' },
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' }
        ]"
      />
    </UFormField>

    <UFormField label="Date from">
      <AppDateInput v-model="filters.dateFrom" />
    </UFormField>

    <UFormField label="Date to">
      <AppDateInput v-model="filters.dateTo" />
    </UFormField>
  </div>
</template>
