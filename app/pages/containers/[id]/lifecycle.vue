<script setup lang="ts">
import type { Container, LifecycleSummary } from '~/types'

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

const eventType = ref('all')
const dateFrom = ref('')
const dateTo = ref('')

const { data: containerRes, pending } = useApi<Container>(() =>
  `/api/containers/${containerId.value}`
)

const container = computed(() => containerRes.value?.data)

const { data: summaryRes, pending: summaryPending } = useApi<LifecycleSummary>(() =>
  `/api/lifecycle/summary?containerId=${containerId.value}`
)

const eventTypeItems = computed(() => [
  { label: t('movements.types.all'), value: 'all' },
  { label: t('movements.types.registration'), value: 'Registration' },
  { label: t('movements.types.survey'), value: 'Survey' },
  { label: t('movements.types.repair'), value: 'Repair' },
  { label: t('movements.types.maintenance'), value: 'Maintenance' },
  { label: t('movements.types.relocation'), value: 'Relocation' },
  { label: t('movements.types.gateIn'), value: 'GateIn' },
  { label: t('movements.types.gateOut'), value: 'GateOut' },
  { label: t('movements.types.statusChange'), value: 'StatusChange' }
])
</script>

<template>
  <UDashboardPanel id="container-lifecycle" grow>
    <template #header>
      <UDashboardNavbar :title="container ? `${t('containers.lifecycle')} — ${container.containerNumber}` : t('containers.lifecycle')">
        <template #leading>
          <div class="flex items-center gap-2">
            <UDashboardSidebarCollapse />
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              to="/containers/lifecycle"
            />
          </div>
        </template>

        <template #right>
          <UButton
            v-if="canWrite && container"
            :label="t('containers.addEvent')"
            icon="i-lucide-plus"
            :to="`/containers/${container.containerId}/events/create`"
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
      <div class="space-y-6 p-4 md:p-6">
        <div v-if="!container && !pending" class="py-12">
          <UAlert
            color="error"
            icon="i-lucide-alert-circle"
            :title="t('containers.notFound')"
            :description="t('containers.notFoundDesc')"
          />
        </div>

        <template v-else-if="container">
          <ContainersLifecycleContainerLifecycleSummary
            :summary="summaryRes?.data"
            :loading="summaryPending"
          />

          <UCard>
            <div class="mb-6 flex flex-wrap items-end gap-3">
              <USelect
                v-model="eventType"
                :items="eventTypeItems"
                class="min-w-44"
              />
              <AppDateInput v-model="dateFrom" class="min-w-36" />
              <AppDateInput v-model="dateTo" class="min-w-36" />
            </div>

            <ContainersContainerTimeline
              :container-id="container.containerId"
              :can-write="canWrite"
              :event-type="eventType"
              :date-from="dateFrom"
              :date-to="dateTo"
            />
          </UCard>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
