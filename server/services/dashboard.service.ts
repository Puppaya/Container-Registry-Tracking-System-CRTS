import {
  containerEventRepository,
  containerRepository
} from '../utils/repositories'
import type { DashboardActivity, DashboardSummary } from '../types/dashboard'

function buildRegistrationTrend(registrations: Array<{ registrationDate: Date }>) {
  const buckets = new Map<string, number>()
  const now = new Date()

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    buckets.set(label, 0)
  }

  registrations.forEach(({ registrationDate }) => {
    const label = new Date(registrationDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    if (buckets.has(label)) {
      buckets.set(label, (buckets.get(label) || 0) + 1)
    }
  })

  return Array.from(buckets.entries()).map(([label, count]) => ({ label, count }))
}

export class DashboardService {
  async getSummary(): Promise<DashboardSummary> {
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const trendSince = new Date()
    trendSince.setMonth(trendSince.getMonth() - 5)
    trendSince.setDate(1)

    const [
      totalContainers,
      activeContainers,
      inactiveContainers,
      surveyedContainers,
      requiringAttention,
      recentRegistrations,
      statusGroups,
      registrationDates
    ] = await Promise.all([
      containerRepository.countAll(),
      containerRepository.countByStatus('Active'),
      containerRepository.countByStatus('Inactive'),
      containerRepository.countSurveyed(),
      containerRepository.countRequiringAttention(),
      containerRepository.countRegisteredSince(since),
      containerRepository.groupByStatus(),
      containerRepository.findRegistrationDatesSince(trendSince)
    ])

    return {
      totalContainers,
      activeContainers,
      inactiveContainers,
      surveyedContainers,
      notSurveyedContainers: totalContainers - surveyedContainers,
      requiringAttention,
      recentRegistrations,
      statusBreakdown: statusGroups.map((item: { status: string, _count: { containerId: number } }) => ({
        status: item.status,
        count: item._count.containerId
      })),
      registrationTrend: buildRegistrationTrend(registrationDates)
    }
  }

  async getRecentActivities(limit = 15): Promise<DashboardActivity[]> {
    const events = await containerEventRepository.findRecentActivities(limit)

    return events.map((event: {
      eventId: number
      containerId: number
      eventType: string
      eventDescription?: string | null
      eventDate: Date
      createdBy: string
      container: { containerNumber: string }
    }) => ({
      eventId: event.eventId,
      containerId: event.containerId,
      containerNumber: event.container.containerNumber,
      eventType: event.eventType,
      eventDescription: event.eventDescription,
      eventDate: event.eventDate.toISOString(),
      createdBy: event.createdBy
    }))
  }
}

export const dashboardService = new DashboardService()
