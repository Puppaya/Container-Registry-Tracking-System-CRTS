<script setup lang="ts">
import type { SurveyInspectionListResult, SurveyInspectionRecord, SurveyInspectionSummary } from '~/types'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management']
})

const { t } = useI18n()
const { user } = useUserSession()
const canSync = computed(() =>
  ['Administrator', 'RegistryOfficer'].includes((user.value as { role?: string })?.role || '')
)

const page = ref(1)
const pageSize = ref(20)
const search = ref('')
const result = ref('all')
const dateFrom = ref('')
const dateTo = ref('')

watch([pageSize, result, dateFrom, dateTo], () => {
  page.value = 1
})

const { data: recordsRes, pending, refresh } = useApi<SurveyInspectionListResult>(() => {
  const params = new URLSearchParams({
    page: page.value.toString(),
    pageSize: pageSize.value.toString(),
    search: search.value
  })
  if (result.value !== 'all') params.append('result', result.value)
  if (dateFrom.value) params.append('dateFrom', dateFrom.value)
  if (dateTo.value) params.append('dateTo', dateTo.value)
  return `/api/survey/inspections?${params.toString()}`
})

const { data: summaryRes, pending: summaryPending, refresh: refreshSummary } = useApi<SurveyInspectionSummary>(() =>
  '/api/survey/inspections/summary'
)

const dataSource = computed(() => recordsRes.value?.data?.meta?.dataSource || summaryRes.value?.data?.dataSource)

const { sync: syncSurveys, syncing } = useSurveySync()

async function handleSyncSurveys() {
  await syncSurveys({
    onSuccess: () => {
      refresh()
      refreshSummary()
    }
  })
}

function openDetail(record: SurveyInspectionRecord) {
  navigateTo(`/survey/inspections/${record.surveyId}`)
}
</script>

<template>
  <UDashboardPanel id="survey-inspections" grow>
    <template #header>
      <UDashboardNavbar :title="t('survey.title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            v-if="canSync"
            :label="t('common.syncSurveys')"
            icon="i-lucide-refresh-cw"
            :loading="syncing"
            :disabled="syncing"
            @click="handleSyncSurveys"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <SurveyInspectionFilters
            v-model:search="search"
            v-model:result="result"
            v-model:date-from="dateFrom"
            v-model:date-to="dateTo"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="space-y-6 overflow-y-auto p-4 md:p-6">
        <UAlert
          v-if="dataSource === 'mock'"
          color="info"
          icon="i-lucide-info"
          :title="t('survey.mockAlertTitle')"
          :description="t('survey.mockAlertDesc')"
        />

        <SurveyInspectionSummary
          :summary="summaryRes?.data"
          :loading="summaryPending"
        />

        <SurveyInspectionTable
          :records="recordsRes?.data?.data || []"
          :loading="pending"
          @view="openDetail"
        />

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-muted">
            {{ recordsRes?.data?.meta?.total || 0 }} inspection record(s)
          </p>
          <UPagination
            v-model:page="page"
            :total="recordsRes?.data?.meta?.total || 0"
            :items-per-page="pageSize"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
