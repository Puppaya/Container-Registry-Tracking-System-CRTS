export interface DashboardSummary {
  totalContainers: number
  activeContainers: number
  inactiveContainers: number
  surveyedContainers: number
  notSurveyedContainers: number
  requiringAttention: number
  recentRegistrations: number
  statusBreakdown: Array<{ status: string, count: number }>
  registrationTrend: Array<{ label: string, count: number }>
}

export interface DashboardActivity {
  eventId: number
  containerId: number
  containerNumber: string
  eventType: string
  eventDescription?: string | null
  eventDate: string
  createdBy: string
}
