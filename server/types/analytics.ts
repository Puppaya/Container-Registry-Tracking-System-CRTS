export interface AnalyticsKpis {
  totalContainers: number
  activeContainers: number
  inactiveContainers: number
  surveyedContainers: number
  notSurveyedContainers: number
  requiringAttention: number
  recentRegistrations: number
  totalEvents: number
  totalMovements: number
  totalSurveys: number
}

export interface AnalyticsBreakdownItem {
  label: string
  count: number
}

export interface AnalyticsEventBreakdownItem {
  eventType: string
  count: number
}

export interface AnalyticsOverview {
  kpis: AnalyticsKpis
  statusBreakdown: AnalyticsBreakdownItem[]
  sizeBreakdown: AnalyticsBreakdownItem[]
  categoryBreakdown: AnalyticsBreakdownItem[]
  registrationTrend: AnalyticsBreakdownItem[]
  eventBreakdown: AnalyticsEventBreakdownItem[]
  surveyResults: AnalyticsBreakdownItem[]
  generatedAt: string
}
