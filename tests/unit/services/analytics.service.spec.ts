import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyticsService } from '../../../server/services/analytics.service'
import { dashboardService } from '../../../server/services/dashboard.service'
import {
  containerEventRepository,
  containerRepository,
  containerSurveyRepository
} from '../../../server/utils/repositories'

vi.mock('../../../server/services/dashboard.service', () => ({
  dashboardService: {
    getSummary: vi.fn()
  }
}))

vi.mock('../../../server/utils/repositories', () => ({
  containerRepository: {
    groupByField: vi.fn()
  },
  containerEventRepository: {
    groupByEventType: vi.fn(),
    count: vi.fn(),
    countMovements: vi.fn()
  },
  containerSurveyRepository: {
    groupByResult: vi.fn(),
    count: vi.fn()
  }
}))

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should aggregate overview metrics from dashboard and repositories', async () => {
    vi.mocked(dashboardService.getSummary).mockResolvedValue({
      totalContainers: 100,
      activeContainers: 80,
      inactiveContainers: 20,
      surveyedContainers: 60,
      notSurveyedContainers: 40,
      requiringAttention: 15,
      recentRegistrations: 8,
      statusBreakdown: [{ status: 'Active', count: 80 }],
      registrationTrend: [{ label: 'Jan 26', count: 5 }]
    } as any)

    vi.mocked(containerRepository.groupByField)
      .mockResolvedValueOnce([{ containerSize: '40', _count: { containerId: 50 } }] as any)
      .mockResolvedValueOnce([{ containerCategory: 'Dry', _count: { containerId: 30 } }] as any)

    vi.mocked(containerEventRepository.groupByEventType).mockResolvedValue([
      { eventType: 'Registration', _count: { eventId: 10 } }
    ] as any)

    vi.mocked(containerSurveyRepository.groupByResult).mockResolvedValue([
      { result: 'Pass', _count: { surveyId: 30 } }
    ] as any)

    vi.mocked(containerEventRepository.count).mockResolvedValue(200)
    vi.mocked(containerEventRepository.countMovements).mockResolvedValue(45)
    vi.mocked(containerSurveyRepository.count).mockResolvedValue(60)

    const result = await analyticsService.getOverview()

    expect(result.kpis.totalContainers).toBe(100)
    expect(result.kpis.totalEvents).toBe(200)
    expect(result.kpis.totalMovements).toBe(45)
    expect(result.kpis.totalSurveys).toBe(60)
    expect(result.statusBreakdown).toEqual([{ label: 'Active', count: 80 }])
    expect(result.eventBreakdown[0]?.eventType).toBe('Registration')
    expect(result.generatedAt).toBeTruthy()
  })
})
