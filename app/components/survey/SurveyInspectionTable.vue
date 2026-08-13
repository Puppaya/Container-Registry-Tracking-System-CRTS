<script setup lang="ts">
import type { SurveyInspectionRecord } from '~/types'
import { formatSurveyDate, getSurveyResultColor, surveyResultLabel } from '~/utils/survey-inspection'

const { t } = useI18n()

defineProps<{
  records: SurveyInspectionRecord[]
  loading?: boolean
}>()

const emit = defineEmits<{
  view: [record: SurveyInspectionRecord]
}>()
</script>

<template>
  <div>
    <AppEmptyState
      v-if="!loading && records.length === 0"
      variant="inline"
      icon="i-lucide-clipboard-list"
      :title="t('emptyState.surveyRecords.title')"
      :description="t('emptyState.surveyRecords.description')"
    />
    <UTable
      v-else
      :data="records"
      :loading="loading"
      :columns="[
        { accessorKey: 'surveyReferenceNo', header: t('survey.columns.reference') },
        { accessorKey: 'containerNumber', header: t('survey.columns.container') },
        { accessorKey: 'surveyDate', header: t('survey.columns.inspectionDate') },
        { accessorKey: 'inspector', header: t('survey.columns.inspector') },
        { accessorKey: 'result', header: t('survey.columns.result') },
        { accessorKey: 'damageSummary', header: t('survey.columns.damage') },
        { id: 'actions', header: '' }
      ]"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
        separator: 'h-0'
      }"
    >
      <template #surveyReferenceNo-cell="{ row }">
        <div class="flex items-center gap-2">
          <span class="font-mono text-sm">{{ (row.original as unknown as SurveyInspectionRecord).surveyReferenceNo }}</span>
          <UBadge
            v-if="(row.original as unknown as SurveyInspectionRecord).isMock"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            {{ t('survey.mockBadge') }}
          </UBadge>
        </div>
      </template>

      <template #containerNumber-cell="{ row }">
        <NuxtLink
          v-if="(row.original as unknown as SurveyInspectionRecord).containerId"
          :to="`/containers/${(row.original as unknown as SurveyInspectionRecord).containerId}`"
          class="font-mono text-primary hover:underline"
        >
          {{ (row.original as unknown as SurveyInspectionRecord).containerNumber }}
        </NuxtLink>
        <span v-else class="font-mono">{{ (row.original as unknown as SurveyInspectionRecord).containerNumber }}</span>
      </template>

      <template #surveyDate-cell="{ row }">
        {{ formatSurveyDate((row.original as unknown as SurveyInspectionRecord).surveyDate) }}
      </template>

      <template #inspector-cell="{ row }">
        {{ (row.original as unknown as SurveyInspectionRecord).inspector || '—' }}
      </template>

      <template #result-cell="{ row }">
        <UBadge
          :color="getSurveyResultColor((row.original as unknown as SurveyInspectionRecord).result)"
          variant="subtle"
          size="sm"
        >
          {{ surveyResultLabel((row.original as unknown as SurveyInspectionRecord).result, t) }}
        </UBadge>
      </template>

      <template #damageSummary-cell="{ row }">
        <span class="truncate block max-w-xs text-sm text-muted">
          {{ (row.original as unknown as SurveyInspectionRecord).damageSummary || '—' }}
        </span>
      </template>

      <template #actions-cell="{ row }">
        <UButton
          icon="i-lucide-eye"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="emit('view', row.original as unknown as SurveyInspectionRecord)"
        />
      </template>
    </UTable>
  </div>
</template>
