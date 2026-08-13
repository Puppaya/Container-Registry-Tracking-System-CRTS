<script setup lang="ts">
definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'Management']
})

import { formatDisplayDateTime } from '~/utils/date-format'

const { t } = useI18n()

const {
  overview,
  loading,
  error,
  refresh
} = useAnalytics()

const generatedAt = computed(() => {
  if (!overview.value?.generatedAt) return null
  return formatDisplayDateTime(overview.value.generatedAt)
})

async function handleRefresh() {
  await refresh(true)
}
</script>

<template>
  <UDashboardPanel id="analytics-center" grow class="ds-page">
    <template #header>
      <UDashboardNavbar :title="t('analytics.title')" class="bg-surface border-b border-[color-mix(in_srgb,var(--ds-border)_80%,transparent)]">
        <template #leading>
          <div class="flex items-center gap-2">
            <UDashboardSidebarCollapse />
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              to="/dashboard"
            />
          </div>
        </template>

        <template #right>
          <UButton
            :label="t('reports.title')"
            icon="i-lucide-file-bar-chart"
            color="neutral"
            variant="outline"
            size="sm"
            to="/analytics/reports"
          />
          <UButton
            icon="i-lucide-refresh-cw"
            color="primary"
            variant="outline"
            size="sm"
            :loading="loading"
            aria-label="Refresh analytics"
            @click="handleRefresh"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar v-if="generatedAt" class="bg-surface-container-low/50">
        <template #left>
          <p class="font-mono text-xs text-on-surface-variant">
            {{ t('analytics.lastUpdated', { date: generatedAt }) }}
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="ds-page-content">
        <UAlert
          v-if="error"
          color="error"
          icon="i-lucide-alert-circle"
          :title="t('analytics.loadError')"
          :description="error"
          class="rounded-md"
        />

        <PageModuleHeader
          :title="t('analytics.title')"
          :description="t('analytics.desc')"
        />

        <AnalyticsKpiGrid
          :overview="overview"
          :loading="loading"
        />

        <div class="grid gap-6 xl:grid-cols-2">
          <AnalyticsRegistrationChart
            :items="overview?.registrationTrend"
            :loading="loading"
          />

          <AnalyticsBreakdownChart
            title="Status Distribution"
            icon="i-lucide-pie-chart"
            :items="overview?.statusBreakdown"
            :loading="loading"
            color-class="bg-success"
          />
        </div>

        <div class="grid gap-6 xl:grid-cols-2">
          <AnalyticsBreakdownChart
            title="Container Size Distribution"
            icon="i-lucide-ruler"
            :items="overview?.sizeBreakdown"
            :loading="loading"
            color-class="bg-primary-container"
          />

          <AnalyticsBreakdownChart
            title="Category Distribution"
            icon="i-lucide-layers"
            :items="overview?.categoryBreakdown"
            :loading="loading"
            color-class="bg-primary"
          />
        </div>

        <div class="grid gap-6 xl:grid-cols-2">
          <AnalyticsEventBreakdown
            :items="overview?.eventBreakdown"
            :loading="loading"
          />

          <AnalyticsBreakdownChart
            title="Survey Results"
            icon="i-lucide-clipboard-check"
            :items="overview?.surveyResults"
            :loading="loading"
            color-class="bg-warning"
          />
        </div>

        <AnalyticsReportCatalog />
      </div>
    </template>
  </UDashboardPanel>
</template>
