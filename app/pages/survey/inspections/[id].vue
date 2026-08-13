<script setup lang="ts">
import type { SurveyInspectionRecord } from '~/types'
import { formatSurveyDate, getSurveyResultColor, surveyResultLabel } from '~/utils/survey-inspection'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management']
})

const { t } = useI18n()
const route = useRoute()
const recordId = computed(() => Number(route.params.id))

const { data: recordRes, pending } = useApi<SurveyInspectionRecord>(() =>
  `/api/survey/inspections/${recordId.value}`
)

const record = computed(() => recordRes.value?.data)
</script>

<template>
  <UDashboardPanel id="survey-inspection-detail" grow>
    <template #header>
      <UDashboardNavbar :title="t('survey.detail')">
        <template #leading>
          <div class="flex items-center gap-2">
            <UDashboardSidebarCollapse />
            <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/survey/inspections" />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="pending" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
      </div>

      <div v-else-if="record" class="mx-auto max-w-3xl p-4 md:p-6">
        <UCard class="space-y-6">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge v-if="record.isMock" color="neutral" variant="subtle">{{ t('survey.mockData') }}</UBadge>
            <UBadge :color="getSurveyResultColor(record.result)" variant="subtle">
              {{ surveyResultLabel(record.result, t) }}
            </UBadge>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="text-xs text-muted">{{ t('survey.fields.reference') }}</p>
              <p class="font-mono font-medium">{{ record.surveyReferenceNo }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">{{ t('survey.columns.container') }}</p>
              <p class="font-mono font-medium">{{ record.containerNumber }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">{{ t('survey.columns.inspectionDate') }}</p>
              <p>{{ formatSurveyDate(record.surveyDate) }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">{{ t('survey.fields.inspector') }}</p>
              <p>{{ record.inspector || '—' }}</p>
            </div>
            <div v-if="record.containerOwner">
              <p class="text-xs text-muted">{{ t('survey.fields.owner') }}</p>
              <p>{{ record.containerOwner }}</p>
            </div>
            <div v-if="record.containerStatus">
              <p class="text-xs text-muted">{{ t('survey.fields.containerStatus') }}</p>
              <p>{{ record.containerStatus }}</p>
            </div>
          </div>

          <div>
            <p class="text-xs text-muted mb-1">{{ t('survey.fields.damageSummary') }}</p>
            <p class="text-sm">{{ record.damageSummary || t('survey.noDamageReported') }}</p>
          </div>

          <div class="flex flex-wrap gap-2 border-t border-default pt-4">
            <UButton
              v-if="record.reportUrl"
              :to="record.reportUrl"
              target="_blank"
              icon="i-lucide-file-text"
              :label="t('common.openReport')"
              variant="outline"
            />
            <UButton
              v-if="record.containerId"
              :to="`/containers/${record.containerId}/surveys`"
              icon="i-lucide-container"
              :label="t('survey.containerSurveys')"
              variant="ghost"
            />
          </div>
        </UCard>
      </div>

      <div v-else class="p-6">
        <UAlert color="error" icon="i-lucide-alert-circle" :title="t('survey.notFound')" />
      </div>
    </template>
  </UDashboardPanel>
</template>
