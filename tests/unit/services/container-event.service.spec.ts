import { describe, it, expect, vi, beforeEach } from 'vitest'
import { containerEventService } from '../../../server/services/container-event.service'
import { containerRepository, containerEventRepository } from '../../../server/utils/repositories'

vi.mock('../../../server/utils/audit-log', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('../../../server/utils/repositories', () => ({
  containerRepository: {
    findByContainerId: vi.fn()
  },
  containerEventRepository: {
    findByContainerId: vi.fn(),
    findPaginatedLifecycle: vi.fn(),
    groupByEventType: vi.fn(),
    count: vi.fn(),
    create: vi.fn()
  }
}))

describe('ContainerEventService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTimeline', () => {
    it('should return container and mapped events', async () => {
      const mockContainer = { containerId: 1, containerNumber: 'MSCU1234566' }
      const mockEvents = [{
        eventId: 1,
        containerId: 1,
        eventType: 'Registration',
        eventDescription: 'Registered',
        eventDate: new Date('2026-01-01'),
        createdBy: 'registry',
        createdDate: new Date('2026-01-01')
      }]

      vi.mocked(containerRepository.findByContainerId).mockResolvedValue(mockContainer as any)
      vi.mocked(containerEventRepository.findByContainerId).mockResolvedValue(mockEvents as any)

      const result = await containerEventService.getTimeline(1)

      expect(result.container).toEqual(mockContainer)
      expect(result.events[0].eventType).toBe('Registration')
      expect(result.events[0].containerNumber).toBe('MSCU1234566')
    })

    it('should pass timeline filters to repository', async () => {
      vi.mocked(containerRepository.findByContainerId).mockResolvedValue({ containerId: 1 } as any)
      vi.mocked(containerEventRepository.findByContainerId).mockResolvedValue([])

      await containerEventService.getTimeline(1, {
        eventType: 'Repair',
        dateFrom: new Date('2026-01-01'),
        dateTo: new Date('2026-01-31')
      })

      expect(containerEventRepository.findByContainerId).toHaveBeenCalledWith(1, {
        eventType: 'Repair',
        dateFrom: new Date('2026-01-01'),
        dateTo: new Date('2026-01-31')
      })
    })

    it('should throw 404 when container not found', async () => {
      vi.mocked(containerRepository.findByContainerId).mockResolvedValue(null)

      await expect(containerEventService.getTimeline(999)).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('getLifecycleEvents', () => {
    it('should return paginated mapped lifecycle events', async () => {
      vi.mocked(containerEventRepository.findPaginatedLifecycle).mockResolvedValue({
        data: [{
          eventId: 2,
          containerId: 1,
          eventType: 'GateOut',
          eventDescription: 'Departed yard',
          eventDate: new Date('2026-01-20'),
          createdBy: 'registry',
          createdDate: new Date('2026-01-20'),
          container: {
            containerNumber: 'MSCU1234566',
            status: 'Active',
            owner: 'MSC'
          }
        }],
        meta: { total: 1, page: 1, pageSize: 20, totalPages: 1 }
      } as any)

      const result = await containerEventService.getLifecycleEvents({
        page: 1,
        pageSize: 20,
        search: 'MSCU'
      })

      expect(result.data[0].containerNumber).toBe('MSCU1234566')
      expect(result.meta.total).toBe(1)
    })
  })

  describe('getLifecycleSummary', () => {
    it('should aggregate event counts by type', async () => {
      vi.mocked(containerEventRepository.count).mockResolvedValue(5)
      vi.mocked(containerEventRepository.groupByEventType).mockResolvedValue([
        { eventType: 'Registration', _count: { eventId: 2 } },
        { eventType: 'Survey', _count: { eventId: 3 } }
      ] as any)

      const result = await containerEventService.getLifecycleSummary()

      expect(result.totalEvents).toBe(5)
      expect(result.byEventType).toEqual([
        { eventType: 'Registration', count: 2 },
        { eventType: 'Survey', count: 3 }
      ])
    })
  })

  describe('createEvent', () => {
    it('should create event for existing container', async () => {
      vi.mocked(containerRepository.findByContainerId).mockResolvedValue({
        containerId: 1,
        containerNumber: 'MSCU1234566'
      } as any)
      vi.mocked(containerEventRepository.create).mockResolvedValue({
        eventId: 2,
        containerId: 1,
        eventType: 'Repair',
        eventDescription: 'Door repair completed',
        eventDate: new Date('2026-01-15'),
        createdBy: 'registry',
        createdDate: new Date('2026-01-15')
      } as any)

      const result = await containerEventService.createEvent(1, {
        eventType: 'Repair',
        eventDescription: 'Door repair completed',
        eventDate: new Date('2026-01-15')
      }, 'registry')

      expect(result.eventId).toBe(2)
      expect(result.containerNumber).toBe('MSCU1234566')
    })
  })
})
