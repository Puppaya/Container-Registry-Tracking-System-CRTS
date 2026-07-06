<script setup lang="ts">
definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management']
})

const { user } = useUserSession()

const { t } = useI18n()

const canViewReports = computed(() =>
  ['Administrator', 'Management'].includes((user.value as { role?: string })?.role || '')
)

const {
  summary,
  activities,
  loading,
  error,
  refresh
} = useDashboardData({ limit: 8 })

const {
  alerts,
  loading: alertsLoading,
  totalCount: alertTotal,
  refresh: refreshAlerts
} = useDashboardAttention()

async function handleRefresh() {
  await Promise.all([refresh(true), refreshAlerts()])
}
</script>

<template>
  <UDashboardPanel id="dashboard" grow class="ds-dashboard">
    <template #header>
      <UDashboardNavbar :title="t('dashboard.title')" class="bg-surface border-b border-[#e4e2ef]/80">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            v-if="canViewReports"
            :label="t('dashboard.analytics')"
            icon="i-lucide-chart-pie"
            color="neutral"
            variant="outline"
            size="sm"
            to="/analytics"
          />
          <UButton
            :label="t('common.containers')"
            icon="i-lucide-container"
            color="primary"
            size="sm"
            to="/containers"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex min-h-full flex-col bg-surface">
        <div class="flex-1 overflow-y-auto ds-dashboard-content">
          <UAlert
            v-if="error"
            color="error"
            icon="i-lucide-alert-circle"
            :title="t('dashboard.loadError')"
            :description="error"
            class="rounded-md"
          />

          <DashboardPageHeader
            :loading="loading"
            @refresh="handleRefresh"
          />

          <DashboardKpiCards
            :summary="summary"
            :loading="loading"
          />

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="lg:col-span-2 min-h-[320px]">
              <DashboardInventoryTrends
                :summary="summary"
                :loading="loading"
              />
            </div>

            <div class="min-h-[320px]">
              <DashboardAttentionPanel
                :alerts="alerts"
                :total-count="alertTotal"
                :loading="alertsLoading"
              />
            </div>
          </div>

          <DashboardActivityTimeline
            :activities="activities"
            :loading="loading"
          />
        </div>

        <!-- <DashboardStatusFooter /> -->
      </div>
    </template>
  </UDashboardPanel>
</template>
