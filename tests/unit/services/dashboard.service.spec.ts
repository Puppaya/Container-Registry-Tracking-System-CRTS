import { describe, it, expect, vi, beforeEach } from 'vitest'
import { dashboardService } from '../../../server/services/dashboard.service'
import {
  containerEventRepository,
  containerRepository
} from '../../../server/utils/repositories'

vi.mock('../../../server/utils/repositories', () => ({
  containerRepository: {
    countAll: vi.fn(),
    countByStatus: vi.fn(),
    countSurveyed: vi.fn(),
    countRequiringAttention: vi.fn(),
    countRegisteredSince: vi.fn(),
    groupByStatus: vi.fn(),
    findRegistrationDatesSince: vi.fn()
  },
  containerEventRepository: {
    findRecentActivities: vi.fn()
  }
}))

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build dashboard summary', async () => {
    vi.mocked(containerRepository.countAll).mockResolvedValue(10)
    vi.mocked(containerRepository.countByStatus).mockImplementation(async (status: string) =>
      status === 'Active' ? 8 : 2
    )
    vi.mocked(containerRepository.countSurveyed).mockResolvedValue(6)
    vi.mocked(containerRepository.countRequiringAttention).mockResolvedValue(3)
    vi.mocked(containerRepository.countRegisteredSince).mockResolvedValue(2)
    vi.mocked(containerRepository.groupByStatus).mockResolvedValue([
      { status: 'Active', _count: { containerId: 8 } },
      { status: 'Inactive', _count: { containerId: 2 } }
    ] as any)
    vi.mocked(containerRepository.findRegistrationDatesSince).mockResolvedValue([
      { registrationDate: new Date('2026-01-15') }
    ] as any)

    const summary = await dashboardService.getSummary()

    expect(summary.totalContainers).toBe(10)
    expect(summary.activeContainers).toBe(8)
    expect(summary.inactiveContainers).toBe(2)
    expect(summary.notSurveyedContainers).toBe(4)
    expect(summary.registrationTrend).toHaveLength(6)
  })

  it('should map recent activities', async () => {
    vi.mocked(containerEventRepository.findRecentActivities).mockResolvedValue([
      {
        eventId: 1,
        containerId: 2,
        eventType: 'Survey',
        eventDescription: 'Done',
        eventDate: new Date('2026-01-01'),
        createdBy: 'admin',
        container: { containerId: 2, containerNumber: 'MSCU1234566' }
      }
    ] as any)

    const activities = await dashboardService.getRecentActivities(5)

    expect(activities).toHaveLength(1)
    expect(activities[0].containerNumber).toBe('MSCU1234566')
  })
})
