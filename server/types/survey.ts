export interface ExternalSurveyRecord {
  surveyReferenceNo: string
  containerNumber: string
  surveyDate: string | Date
  inspector?: string | null
  result: string
  damageSummary?: string | null
  reportUrl?: string | null
}

export interface SurveySyncResultItem {
  surveyReferenceNo: string
  containerNumber: string
  status: 'created' | 'skipped' | 'failed'
  reason?: string
}

export interface SurveySyncSummary {
  total: number
  created: number
  skipped: number
  failed: number
  items: SurveySyncResultItem[]
  fetchSource?: 'external' | 'mock'
  containerNumber?: string
}
