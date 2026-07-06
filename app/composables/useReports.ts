import type { ReportTable } from '~/types'
import { REPORTS, buildReportUrl, type ReportKey } from '~/utils/reports'

export interface ReportFilters {
  status: string
  dateFrom: string
  dateTo: string
}

export function useReports() {
  const toast = useToast()

  const filters = reactive<ReportFilters>({
    status: 'all',
    dateFrom: '',
    dateTo: ''
  })

  const activeReport = ref<ReportKey>('registry')
  const preview = ref<ReportTable | null>(null)
  const previewPending = ref(false)

  const activeConfig = computed(() => REPORTS.find(report => report.key === activeReport.value)!)

  function getPreviewParams() {
    const params: Record<string, string> = {}
    if (activeReport.value === 'registry' && filters.status !== 'all') {
      params.status = filters.status
    }
    if (filters.dateFrom) params.dateFrom = filters.dateFrom
    if (filters.dateTo) params.dateTo = filters.dateTo
    return params
  }

  async function loadPreview() {
    previewPending.value = true
    try {
      const url = buildReportUrl(activeConfig.value.endpoint, 'json', getPreviewParams())
      const response = await $fetch<{ data: ReportTable }>(url)
      preview.value = response.data
    } catch (err: unknown) {
      preview.value = null
      const message = (err as { data?: { message?: string } })?.data?.message
        || 'Failed to load report preview'
      toast.add({
        title: 'Report error',
        description: message,
        color: 'error',
        icon: 'i-lucide-circle-x'
      })
    } finally {
      previewPending.value = false
    }
  }

  function exportReport(format: 'xlsx' | 'pdf') {
    window.open(
      buildReportUrl(activeConfig.value.endpoint, format, getPreviewParams()),
      '_blank'
    )
  }

  const previewRows = computed(() => {
    if (!preview.value) return []
    return preview.value.rows.map((row) => {
      const record: Record<string, string | number | null> = {}
      row.forEach((cell, index) => {
        record[`col${index}`] = cell
      })
      return record
    })
  })

  const previewColumns = computed(() =>
    (preview.value?.headers || []).map((header, index) => ({
      accessorKey: `col${index}`,
      header
    }))
  )

  watch(activeReport, () => {
    loadPreview()
  })

  watch(filters, () => {
    loadPreview()
  }, { deep: true })

  return {
    filters,
    activeReport,
    preview,
    previewPending,
    activeConfig,
    previewRows,
    previewColumns,
    loadPreview,
    exportReport
  }
}
