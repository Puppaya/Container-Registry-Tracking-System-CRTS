<script setup lang="ts">
import type { LifecycleEvent, LifecycleSummary } from '~/types'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management']
})

const { t } = useI18n()

const page = ref(1)
const pageSize = ref(20)
const search = ref('')
const eventType = ref('all')
const dateFrom = ref('')
const dateTo = ref('')

watch([pageSize, eventType, dateFrom, dateTo], () => {
  page.value = 1
})

const { data: eventsRes, pending } = useApi<{
  data: LifecycleEvent[]
  meta: { total: number, page: number, pageSize: number, totalPages: number }
}>(() => {
  const params = new URLSearchParams({
    page: page.value.toString(),
    pageSize: pageSize.value.toString(),
    search: search.value
  })
  if (eventType.value !== 'all') params.append('eventType', eventType.value)
  if (dateFrom.value) params.append('dateFrom', dateFrom.value)
  if (dateTo.value) params.append('dateTo', dateTo.value)
  return `/api/lifecycle/events?${params.toString()}`
})

const { data: summaryRes, pending: summaryPending } = useApi<LifecycleSummary>(() =>
  '/api/lifecycle/summary'
)
</script>

<template>
  <UDashboardPanel id="lifecycle" grow>
    <template #header>
      <UDashboardNavbar :title="t('containers.lifecycle')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <ContainersLifecycleContainerLifecycleFilters
            v-model:search="search"
            v-model:event-type="eventType"
            v-model:date-from="dateFrom"
            v-model:date-to="dateTo"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UDashboardPanelContent class="space-y-6 p-4 md:p-6">
        <p class="text-sm text-muted">
          Track registration, surveys, repairs, maintenance, relocations, and gate movements across all containers.
        </p>

        <ContainersLifecycleContainerLifecycleSummary
          :summary="summaryRes?.data"
          :loading="summaryPending"
        />

        <ContainersLifecycleContainerLifecycleTable
          :events="eventsRes?.data?.data || []"
          :loading="pending"
          show-container
        />

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-muted">
            {{ eventsRes?.data?.meta?.total || 0 }} event(s)
          </p>
          <UPagination
            v-model:page="page"
            :total="eventsRes?.data?.meta?.total || 0"
            :items-per-page="pageSize"
          />
        </div>
      </UDashboardPanelContent>
    </template>
  </UDashboardPanel>
</template>
