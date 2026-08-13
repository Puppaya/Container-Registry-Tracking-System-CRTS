<script setup lang="ts">
import type { ReportKey } from '~/utils/reports'
import { formatDisplayDateTime } from '~/utils/date-format'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'Management']
})

const { t } = useI18n()
const route = useRoute()

const reportKeyToi18n: Record<string, string> = {
  'registry': 'reports.registry',
  'lifecycle': 'reports.lifecycle',
  'survey-coverage': 'reports.surveyCoverage',
  'status-summary': 'reports.statusSummary'
}

const {
  filters,
  activeReport,
  preview,
  previewPending,
  activeConfig,
  previewRows,
  previewColumns,
  loadPreview,
  exportReport
} = useReports()

const initialReport = route.query.report
if (typeof initialReport === 'string') {
  activeReport.value = initialReport as ReportKey
}

onMounted(() => {
  loadPreview()
})
</script>

<template>
  <UDashboardPanel id="analytics-reports" grow class="ds-page">
    <template #header>
      <UDashboardNavbar :title="t('reports.title')" class="bg-surface border-b border-[color-mix(in_srgb,var(--ds-border)_80%,transparent)]">
        <template #leading>
          <div class="flex items-center gap-2">
            <UDashboardSidebarCollapse />
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              to="/analytics"
            />
          </div>
        </template>

        <template #right>
          <LocaleSwitcher />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="ds-page-content">
        <PageModuleHeader
          :title="t('reports.title')"
          :description="t('reports.desc')"
        />

        <ReportsReportCatalog
          :active-report="activeReport"
          @select="activeReport = $event"
        />

        <div class="ds-card">
          <div class="ds-card-header flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="ds-section-title">{{ t(reportKeyToi18n[activeConfig.key] + '.title') }}</h2>
              <p class="ds-body-sm mt-0.5">
                {{ t('reports.previewNote', { date: preview?.generatedAt ? formatDisplayDateTime(preview.generatedAt) : '—' }) }}
              </p>
            </div>

            <ReportsReportExportActions @export="exportReport" />
          </div>

          <div class="ds-card-body space-y-4">
            <ReportsReportFilters
              :filters="filters"
              :active-report="activeReport"
            />

            <ReportsReportPreviewTable
              :rows="previewRows"
              :columns="previewColumns"
              :loading="previewPending"
            />
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
