<script setup lang="ts">
import type { ContainerSurvey } from '~/types'
import { formatEventDate } from '~/utils/container-events'
import { getSurveyResultColor } from '~/utils/survey-inspection'

defineProps<{
  survey: ContainerSurvey | null
  containerId: number
  canSync?: boolean
  syncing?: boolean
  dataSource?: 'database' | 'mock'
}>()

const emit = defineEmits<{
  sync: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="space-y-4">
    <div v-if="canSync" class="flex justify-end">
      <UButton
        :label="t('common.syncSurvey')"
        icon="i-lucide-refresh-cw"
        size="sm"
        variant="outline"
        :loading="syncing"
        :disabled="syncing"
        @click="emit('sync')"
      />
    </div>

    <UAlert
      v-if="dataSource === 'mock' && survey"
      color="info"
      icon="i-lucide-info"
      :title="t('survey.mockPreviewTitle')"
      :description="t('survey.mockPreviewDesc')"
    />

    <AppEmptyState
      v-if="!survey"
      icon="i-lucide-search-check"
      :title="t('survey.empty')"
      :description="t('survey.emptyHint')"
      :action-label="t('survey.viewInspectionRecords')"
      action-to="/survey/inspections"
      action-icon="i-lucide-clipboard-list"
      action-variant="link"
    />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <p class="text-xs text-muted mb-1">Reference No.</p>
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium font-mono">{{ survey.surveyReferenceNo }}</p>
          <UBadge v-if="survey.isMock" color="neutral" variant="subtle" size="sm">{{ t('survey.mockBadge') }}</UBadge>
        </div>
      </div>
      <div>
        <p class="text-xs text-muted mb-1">Survey Date</p>
        <p class="text-sm font-medium">{{ formatEventDate(survey.surveyDate) }}</p>
      </div>
      <div>
        <p class="text-xs text-muted mb-1">Inspector</p>
        <p class="text-sm font-medium">{{ survey.inspector || '—' }}</p>
      </div>
      <div>
        <p class="text-xs text-muted mb-1">Result</p>
        <UBadge :color="getSurveyResultColor(survey.result)" variant="subtle">
          {{ survey.result }}
        </UBadge>
      </div>
      <div v-if="survey.damageSummary" class="sm:col-span-2">
        <p class="text-xs text-muted mb-1">Damage Summary</p>
        <p class="text-sm">{{ survey.damageSummary }}</p>
      </div>
      <div v-if="survey.reportUrl" class="sm:col-span-2">
        <UButton
          :to="survey.reportUrl"
          target="_blank"
          icon="i-lucide-file-text"
          :label="t('survey.viewSurveyReport')"
          variant="outline"
          size="sm"
        />
      </div>
    </div>

    <div class="pt-2 border-t border-default flex flex-wrap gap-3">
      <UButton
        :to="`/containers/${containerId}/surveys`"
        :label="t('survey.containerSurveyHistory')"
        icon="i-lucide-history"
        variant="link"
        size="sm"
        class="px-0"
      />
      <UButton
        to="/survey/inspections"
        :label="t('survey.allInspectionRecords')"
        icon="i-lucide-clipboard-list"
        variant="link"
        size="sm"
        class="px-0"
      />
    </div>
  </div>
</template>
