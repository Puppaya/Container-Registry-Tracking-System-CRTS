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

const timelineRef = useTemplateRef<{ refresh: () => void }>('timeline')

const { data: timelineRes, pending: containerPending } = useApi<{
  container: Container
  events: unknown[]
}>(() => `/api/containers/${containerId.value}/timeline`)

const container = computed(() => timelineRes.value?.data?.container)

const { data: summaryRes, pending: summaryPending } = useApi<LifecycleSummary>(() =>
  `/api/lifecycle/summary?containerId=${containerId.value}`
)
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
      <UDashboardPanelContent class="space-y-6 p-4 md:p-6">
        <div v-if="containerPending" class="flex justify-center py-12">
          <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
        </div>

        <template v-else-if="container">
          <ContainersLifecycleContainerLifecycleSummary
            :summary="summaryRes?.data"
            :loading="summaryPending"
          />

          <UCard>
            <div class="flex flex-wrap items-end gap-3 mb-6">
              <USelect
                v-model="eventType"
                :items="[
                  { label: 'All event types', value: 'all' },
                  { label: 'Registration', value: 'Registration' },
                  { label: 'Survey', value: 'Survey' },
                  { label: 'Repair', value: 'Repair' },
                  { label: 'Maintenance', value: 'Maintenance' },
                  { label: 'Relocation', value: 'Relocation' },
                  { label: 'Gate In', value: 'GateIn' },
                  { label: 'Gate Out', value: 'GateOut' },
                  { label: 'Status Change', value: 'StatusChange' }
                ]"
                class="min-w-44"
              />
              <AppDateInput v-model="dateFrom" class="min-w-36" />
              <AppDateInput v-model="dateTo" class="min-w-36" />
            </div>

            <ContainersContainerTimeline
              ref="timeline"
              :container-id="container.containerId"
              :can-write="canWrite"
              :event-type="eventType"
              :date-from="dateFrom"
              :date-to="dateTo"
            />
          </UCard>
        </template>

        <UAlert
          v-else
          color="error"
          icon="i-lucide-alert-circle"
          :title="t('containers.notFound')"
          :description="t('containers.notFoundDesc')"
        />
      </UDashboardPanelContent>
    </template>
  </UDashboardPanel>
</template>
