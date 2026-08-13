<script setup lang="ts">
import type { SurveyInspectionSummary } from '~/types'

const { t } = useI18n()

interface SurveyInspectionSummaryProps {
  summary: SurveyInspectionSummary | null | undefined
  loading?: boolean
}

defineProps<SurveyInspectionSummaryProps>()
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">{{ t('survey.summary.total') }}</p>
      <p class="text-2xl font-semibold">{{ loading ? '…' : (summary?.totalInspections ?? 0) }}</p>
    </UCard>
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">{{ t('survey.summary.last30') }}</p>
      <p class="text-2xl font-semibold">{{ loading ? '…' : (summary?.recentInspections ?? 0) }}</p>
    </UCard>
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">{{ t('survey.summary.pass') }}</p>
      <p class="text-2xl font-semibold text-success">{{ loading ? '…' : (summary?.passCount ?? 0) }}</p>
    </UCard>
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">{{ t('survey.summary.conditional') }}</p>
      <p class="text-2xl font-semibold text-warning">{{ loading ? '…' : (summary?.conditionalCount ?? 0) }}</p>
    </UCard>
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">{{ t('survey.summary.fail') }}</p>
      <p class="text-2xl font-semibold text-error">{{ loading ? '…' : (summary?.failCount ?? 0) }}</p>
    </UCard>
  </div>
</template>
