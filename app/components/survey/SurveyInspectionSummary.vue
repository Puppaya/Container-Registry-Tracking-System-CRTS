<script setup lang="ts">
import type { SurveyInspectionSummary } from '~/types'

defineProps<{
  summary: SurveyInspectionSummary | null | undefined
  loading?: boolean
}>()
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">Total Inspections</p>
      <p class="text-2xl font-semibold">{{ loading ? '…' : (summary?.totalInspections ?? 0) }}</p>
    </UCard>
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">Last 30 Days</p>
      <p class="text-2xl font-semibold">{{ loading ? '…' : (summary?.recentInspections ?? 0) }}</p>
    </UCard>
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">Pass</p>
      <p class="text-2xl font-semibold text-success">{{ loading ? '…' : (summary?.passCount ?? 0) }}</p>
    </UCard>
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">Conditional</p>
      <p class="text-2xl font-semibold text-warning">{{ loading ? '…' : (summary?.conditionalCount ?? 0) }}</p>
    </UCard>
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">Fail</p>
      <p class="text-2xl font-semibold text-error">{{ loading ? '…' : (summary?.failCount ?? 0) }}</p>
    </UCard>
  </div>
</template>
