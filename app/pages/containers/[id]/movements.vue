<script setup lang="ts">
import type { Container, MovementEvent, MovementSummary } from '~/types'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management']
})

const { t } = useI18n()
const route = useRoute()
const containerId = computed(() => Number(route.params.id))

const { user } = useUserSession()
const canWrite = computed(() =>
  ['Administrator', 'RegistryOfficer'].includes((user.value as { role?: string })?.role || '')
)

const page = ref(1)
const pageSize = ref(20)
const movementType = ref('all')
const dateFrom = ref('')
const dateTo = ref('')

watch([pageSize, movementType, dateFrom, dateTo], () => {
  page.value = 1
})

const { data: containerRes } = useApi<Container>(() =>
  `/api/containers/${containerId.value}`
)

const container = computed(() => containerRes.value?.data)

const { data: movementsRes, pending, refresh } = useApi<{
  data: MovementEvent[]
  meta: { total: number }
}>(() => {
  const params = new URLSearchParams({
    page: page.value.toString(),
    pageSize: pageSize.value.toString()
  })
  if (movementType.value !== 'all') params.append('movementType', movementType.value)
  if (dateFrom.value) params.append('dateFrom', dateFrom.value)
  if (dateTo.value) params.append('dateTo', dateTo.value)
  return `/api/containers/${containerId.value}/movements?${params.toString()}`
})

const { data: summaryRes, pending: summaryPending } = useApi<MovementSummary>(() =>
  `/api/movements/summary?containerId=${containerId.value}`
)
</script>

<template>
  <UDashboardPanel id="container-movements" grow>
    <template #header>
      <UDashboardNavbar :title="container ? `${t('containers.movements')} — ${container.containerNumber}` : t('containers.movements')">
        <template #leading>
          <div class="flex items-center gap-2">
            <UDashboardSidebarCollapse />
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              to="/containers/movements"
            />
          </div>
        </template>

        <template #right>
          <UButton
            v-if="canWrite && container"
            :label="t('common.recordMovement')"
            icon="i-lucide-plus"
            :to="`/containers/${container.containerId}/movements/create`"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar v-if="container">
        <ContainersContainerProfileNav
          :container-id="container.containerId"
          :container-number="container.containerNumber"
        />
      </UDashboardToolbar>
    </template>

    <template #body>
      <UDashboardPanelContent class="space-y-6 p-4 md:p-6">
        <div v-if="!container && !pending" class="py-12">
          <UAlert
            color="error"
            icon="i-lucide-alert-circle"
            :title="t('containers.notFound')"
          />
        </div>

        <template v-else-if="container">
          <MovementsMovementSummary
            :summary="summaryRes?.data"
            :loading="summaryPending"
          />

          <div class="flex flex-wrap items-end gap-3">
            <USelect
              v-model="movementType"
              :items="[
                { label: 'All movements', value: 'all' },
                { label: 'Gate In', value: 'GateIn' },
                { label: 'Gate Out', value: 'GateOut' },
                { label: 'Relocation', value: 'Relocation' }
              ]"
              class="min-w-40"
            />
            <AppDateInput v-model="dateFrom" class="min-w-36" />
            <AppDateInput v-model="dateTo" class="min-w-36" />
          </div>

          <MovementsMovementTable
            :events="movementsRes?.data?.data || []"
            :loading="pending"
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
        </template>
      </UDashboardPanelContent>
    </template>
  </UDashboardPanel>
</template>
