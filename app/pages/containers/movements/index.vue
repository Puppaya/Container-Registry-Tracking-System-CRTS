<script setup lang="ts">
import type { MovementEvent, MovementSummary, MovementTrackResult } from '~/types'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management']
})

const { t } = useI18n()

const page = ref(1)
const pageSize = ref(20)
const search = ref('')
const movementType = ref('all')
const owner = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const trackQuery = ref('')
const trackResult = ref<MovementTrackResult | null>(null)
const trackError = ref(false)
const trackPending = ref(false)

watch([pageSize, movementType, owner, dateFrom, dateTo], () => {
  page.value = 1
})

const { data: movementsRes, pending, refresh } = useApi<{
  data: MovementEvent[]
  meta: { total: number, page: number, pageSize: number, totalPages: number }
}>(() => {
  const params = new URLSearchParams({
    page: page.value.toString(),
    pageSize: pageSize.value.toString(),
    search: search.value
  })
  if (movementType.value !== 'all') params.append('movementType', movementType.value)
  if (owner.value) params.append('owner', owner.value)
  if (dateFrom.value) params.append('dateFrom', dateFrom.value)
  if (dateTo.value) params.append('dateTo', dateTo.value)
  return `/api/movements?${params.toString()}`
})

const { data: summaryRes, pending: summaryPending } = useApi<MovementSummary>(() =>
  '/api/movements/summary'
)

async function runTrack() {
  if (!trackQuery.value.trim()) return

  trackPending.value = true
  trackError.value = false
  trackResult.value = null

  try {
    const response = await $fetch<{ data: MovementTrackResult }>(
      `/api/movements/track?q=${encodeURIComponent(trackQuery.value.trim())}`
    )
    trackResult.value = response.data
  } catch {
    trackError.value = true
  } finally {
    trackPending.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="movements" grow>
    <template #header>
      <UDashboardNavbar :title="t('movements.title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            :label="t('nav.items.qrScan')"
            icon="i-lucide-qr-code"
            color="neutral"
            variant="outline"
            to="/containers/scan"
          />
          <UButton
            :label="t('containers.advancedSearch')"
            icon="i-lucide-search"
            color="neutral"
            variant="ghost"
            to="/containers/search"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <MovementsMovementFilters
            v-model:search="search"
            v-model:movement-type="movementType"
            v-model:owner="owner"
            v-model:date-from="dateFrom"
            v-model:date-to="dateTo"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UDashboardPanelContent class="space-y-6 p-4 md:p-6">
        <p class="text-sm text-muted">
          Global search and tracking for Gate In, Gate Out, and Relocation events across all containers.
        </p>

        <MovementsMovementTrackPanel
          v-model:track-query="trackQuery"
          :result="trackResult"
          :loading="trackPending"
          :error="trackError"
          @track="runTrack"
        />

        <MovementsMovementSummary
          :summary="summaryRes?.data"
          :loading="summaryPending"
        />

        <MovementsMovementTable
          :events="movementsRes?.data?.data || []"
          :loading="pending"
          show-container
        />

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-muted">
            {{ movementsRes?.data?.meta?.total || 0 }} movement(s)
          </p>
          <UPagination
            v-model:page="page"
            :total="movementsRes?.data?.meta?.total || 0"
            :items-per-page="pageSize"
          />
        </div>
      </UDashboardPanelContent>
    </template>
  </UDashboardPanel>
</template>
