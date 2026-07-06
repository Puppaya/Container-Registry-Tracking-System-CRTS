import { describe, it, expect, vi, beforeEach } from 'vitest'
import { containerMovementService } from '../../../server/services/container-movement.service'
import { containerRepository, containerEventRepository } from '../../../server/utils/repositories'
import { containerEventService } from '../../../server/services/container-event.service'

vi.mock('../../../server/services/container-event.service', () => ({
  containerEventService: {
    createEvent: vi.fn()
  }
}))

vi.mock('../../../server/utils/repositories', () => ({
  containerRepository: {
    findByContainerNumber: vi.fn(),
    findByContainerId: vi.fn(),
    quickSearch: vi.fn()
  },
  containerEventRepository: {
    findPaginatedMovements: vi.fn(),
    countMovements: vi.fn(),
    groupByEventType: vi.fn(),
    findLatestMovementByContainerId: vi.fn(),
    findRecentMovements: vi.fn()
  }
}))

describe('ContainerMovementService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMovements', () => {
    it('should return paginated movement events', async () => {
      vi.mocked(containerEventRepository.findPaginatedMovements).mockResolvedValue({
        data: [{
          eventId: 1,
          containerId: 10,
          eventType: 'GateIn',
          eventDescription: 'Yard A',
          eventDate: new Date('2026-06-01'),
          createdBy: 'registry',
          createdDate: new Date('2026-06-01'),
          container: {
            containerNumber: 'MSCU1234567',
            status: 'Active',
            owner: 'MSC'
          }
        }],
        meta: { total: 1, page: 1, pageSize: 20, totalPages: 1 }
      } as any)

      const result = await containerMovementService.getMovements({
        page: 1,
        pageSize: 20,
        movementType: 'GateIn'
      })

      expect(result.data[0].eventType).toBe('GateIn')
      expect(result.data[0].containerNumber).toBe('MSCU1234567')
    })
  })

  describe('getMovementSummary', () => {
    it('should aggregate movement counts', async () => {
      vi.mocked(containerEventRepository.countMovements)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3)
      vi.mocked(containerEventRepository.groupByEventType).mockResolvedValue([
        { eventType: 'GateIn', _count: { eventId: 4 } },
        { eventType: 'GateOut', _count: { eventId: 3 } },
        { eventType: 'Relocation', _count: { eventId: 3 } }
      ] as any)

      const result = await containerMovementService.getMovementSummary()

      expect(result.totalMovements).toBe(10)
      expect(result.recentMovements).toBe(3)
      expect(result.gateInCount).toBe(4)
    })
  })

  describe('trackContainer', () => {
    it('should return container with latest and recent movements', async () => {
      const mockContainer = {
        containerId: 10,
        containerNumber: 'MSCU1234567',
        isoType: '22G1',
        containerSize: '20',
        containerCategory: 'Dry',
        owner: 'MSC',
        status: 'Active'
      }

      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue(mockContainer as any)
      vi.mocked(containerEventRepository.findLatestMovementByContainerId).mockResolvedValue({
        eventId: 5,
        containerId: 10,
        eventType: 'GateOut',
        eventDescription: 'Departed port',
        eventDate: new Date('2026-06-20'),
        createdBy: 'registry',
        createdDate: new Date('2026-06-20')
      } as any)
      vi.mocked(containerEventRepository.findRecentMovements).mockResolvedValue([])

      const result = await containerMovementService.trackContainer('MSCU1234567')

      expect(result.container.containerNumber).toBe('MSCU1234567')
      expect(result.latestMovement?.eventType).toBe('GateOut')
    })

    it('should throw 404 when container not found', async () => {
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue(null)
      vi.mocked(containerRepository.quickSearch).mockResolvedValue([])

      await expect(containerMovementService.trackContainer('UNKNOWN0000'))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('recordMovement', () => {
    it('should delegate to container event service', async () => {
      vi.mocked(containerEventService.createEvent).mockResolvedValue({
        eventId: 1,
        eventType: 'GateIn'
      } as any)

      await containerMovementService.recordMovement(10, {
        eventType: 'GateIn',
        eventDescription: 'Yard B',
        eventDate: new Date('2026-06-29')
      }, 'registry')

      expect(containerEventService.createEvent).toHaveBeenCalled()
    })
  })
})
