import { dashboardService } from './dashboard.service'
import {
  containerEventRepository,
  containerRepository,
  containerSurveyRepository
} from '../utils/repositories'
import type { AnalyticsOverview } from '../types/analytics'

function mapGroupByCount<T extends string>(
  items: Array<Record<T, string> & { _count: { containerId?: number, eventId?: number, surveyId?: number } }>,
  field: T,
  countKey: 'containerId' | 'eventId' | 'surveyId' = 'containerId'
): Array<{ label: string, count: number }> {
  return items.map(item => ({
    label: item[field],
    count: item._count[countKey] ?? 0
  }))
}

export class AnalyticsService {
  async getOverview(): Promise<AnalyticsOverview> {
    const [
      summary,
      sizeGroups,
      categoryGroups,
      eventGroups,
      surveyGroups,
      totalEvents,
      totalMovements,
      totalSurveys
    ] = await Promise.all([
      dashboardService.getSummary(),
      containerRepository.groupByField('containerSize'),
      containerRepository.groupByField('containerCategory'),
      containerEventRepository.groupByEventType(),
      containerSurveyRepository.groupByResult(),
      containerEventRepository.count(),
      containerEventRepository.countMovements({}),
      containerSurveyRepository.count()
    ])

    return {
      kpis: {
        totalContainers: summary.totalContainers,
        activeContainers: summary.activeContainers,
        inactiveContainers: summary.inactiveContainers,
        surveyedContainers: summary.surveyedContainers,
        notSurveyedContainers: summary.notSurveyedContainers,
        requiringAttention: summary.requiringAttention,
        recentRegistrations: summary.recentRegistrations,
        totalEvents,
        totalMovements,
        totalSurveys
      },
      statusBreakdown: summary.statusBreakdown.map(item => ({
        label: item.status,
        count: item.count
      })),
      sizeBreakdown: mapGroupByCount(sizeGroups, 'containerSize'),
      categoryBreakdown: mapGroupByCount(categoryGroups, 'containerCategory'),
      registrationTrend: summary.registrationTrend.map(item => ({
        label: item.label,
        count: item.count
      })),
      eventBreakdown: eventGroups.map((item: { eventType: string, _count: { eventId: number } }) => ({
        eventType: item.eventType,
        count: item._count.eventId
      })),
      surveyResults: surveyGroups.map((item: { result: string, _count: { surveyId: number } }) => ({
        label: item.result,
        count: item._count.surveyId
      })),
      generatedAt: new Date().toISOString()
    }
  }
}

export const analyticsService = new AnalyticsService()
