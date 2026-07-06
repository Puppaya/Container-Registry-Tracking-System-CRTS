export type ReportFormat = 'json' | 'xlsx' | 'pdf'

export type ReportType =
  | 'registry'
  | 'lifecycle'
  | 'survey-coverage'
  | 'status-summary'

export interface ReportQuery {
  format: ReportFormat
  status?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface ReportTable {
  title: string
  headers: string[]
  rows: Array<Array<string | number | null>>
  generatedAt: string
}
