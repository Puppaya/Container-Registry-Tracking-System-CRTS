export type ReportFormat = 'json' | 'xlsx' | 'pdf'

export type ReportKey = 'registry' | 'lifecycle' | 'survey-coverage' | 'status-summary'

export const REPORTS = [
  {
    key: 'registry' as ReportKey,
    title: 'Container Registry Report',
    description: 'Master data of all registered containers',
    endpoint: '/api/reports/registry'
  },
  {
    key: 'lifecycle' as ReportKey,
    title: 'Container Lifecycle Report',
    description: 'Timeline events across containers',
    endpoint: '/api/reports/lifecycle'
  },
  {
    key: 'survey-coverage' as ReportKey,
    title: 'Survey Coverage Report',
    description: 'Survey status and latest results per container',
    endpoint: '/api/reports/survey-coverage'
  },
  {
    key: 'status-summary' as ReportKey,
    title: 'Status Summary Report',
    description: 'Aggregated counts by status, size, and category',
    endpoint: '/api/reports/status-summary'
  }
]

export function buildReportUrl(
  endpoint: string,
  format: ReportFormat,
  params: Record<string, string> = {}
) {
  const search = new URLSearchParams({ format, ...params })
  return `${endpoint}?${search.toString()}`
}
