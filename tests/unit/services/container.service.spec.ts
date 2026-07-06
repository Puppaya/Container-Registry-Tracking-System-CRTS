import { describe, it, expect, vi, beforeEach } from 'vitest'
import { containerService } from '../../../server/services/container.service'
import {
  containerRepository,
  containerDocumentRepository,
  containerEventRepository,
  containerSurveyRepository
} from '../../../server/utils/repositories'

vi.mock('../../../server/utils/repositories', () => ({
  containerRepository: {
    findPaginated: vi.fn(),
    findByContainerId: vi.fn(),
    findByContainerNumber: vi.fn(),
    findByQrCode: vi.fn(),
    quickSearch: vi.fn(),
    updateByContainerId: vi.fn(),
    deleteByContainerId: vi.fn()
  },
  containerSurveyRepository: {
    findLatestByContainerId: vi.fn(),
    findPaginatedInspections: vi.fn().mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, pageSize: 1, totalPages: 0 }
    })
  },
  containerDocumentRepository: {
    findRecentByContainerId: vi.fn(),
    countByContainerId: vi.fn()
  },
  containerEventRepository: {
    findRecentMovements: vi.fn(),
    findLatestMovementByContainerId: vi.fn(),
    countByContainerId: vi.fn()
  }
}))

vi.mock('../../../server/utils/prisma', () => ({
  default: {
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      container: {
        create: vi.fn().mockResolvedValue({
          containerId: 1,
          containerNumber: 'MSCU1234566',
          registrationDate: new Date('2026-01-01'),
          status: 'Active'
        })
      },
      containerEvent: {
        create: vi.fn().mockResolvedValue({})
      }
    }))
  }
}))

describe('ContainerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getContainers', () => {
    it('should return paginated containers', async () => {
      const mockResult = {
        data: [{ containerId: 1, containerNumber: 'MSCU1234566' }],
        meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 }
      }
      vi.mocked(containerRepository.findPaginated).mockResolvedValue(mockResult as any)

      const result = await containerService.getContainers({
        page: 1,
        pageSize: 10
      })

      expect(result).toEqual(mockResult)
      expect(containerRepository.findPaginated).toHaveBeenCalled()
    })
  })

  describe('getProfile', () => {
    it('should return aggregated profile data', async () => {
      const mockContainer = { containerId: 1, containerNumber: 'MSCU1234566', status: 'Active' }
      vi.mocked(containerRepository.findByContainerId).mockResolvedValue(mockContainer as any)
      vi.mocked(containerSurveyRepository.findLatestByContainerId).mockResolvedValue(null)
      vi.mocked(containerEventRepository.findRecentMovements).mockResolvedValue([])
      vi.mocked(containerEventRepository.findLatestMovementByContainerId).mockResolvedValue(null)
      vi.mocked(containerDocumentRepository.findRecentByContainerId).mockResolvedValue([])
      vi.mocked(containerDocumentRepository.countByContainerId).mockResolvedValue(0)
      vi.mocked(containerEventRepository.countByContainerId).mockResolvedValue(2)

      const result = await containerService.getProfile(1)

      expect(result.container).toEqual(mockContainer)
      expect(result.latestSurvey).not.toBeNull()
      expect(result.latestSurvey?.surveyReferenceNo).toBe('SRV-2026-0003')
      expect(result.surveyDataSource).toBe('mock')
      expect(result.eventCount).toBe(2)
      expect(result.documentCount).toBe(0)
      expect(result.currentStatus.currentLocation).toBeNull()
      expect(result.currentStatus.locationSource).toBe('unknown')
    })

    it('should throw 404 when container not found', async () => {
      vi.mocked(containerRepository.findByContainerId).mockResolvedValue(null)

      await expect(containerService.getProfile(999)).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('quickSearch', () => {
    it('should return empty array for blank query', async () => {
      const result = await containerService.quickSearch('   ')
      expect(result).toEqual([])
    })

    it('should delegate to repository quickSearch', async () => {
      const mockResults = [{ containerId: 1, containerNumber: 'MSCU1234566' }]
      vi.mocked(containerRepository.quickSearch).mockResolvedValue(mockResults as any)

      const result = await containerService.quickSearch('MSCU', 5)

      expect(result).toEqual(mockResults)
      expect(containerRepository.quickSearch).toHaveBeenCalledWith('MSCU', 5)
    })
  })

  describe('findByQrCode', () => {
    it('should find container by qr content', async () => {
      const mockContainer = { containerId: 1, containerNumber: 'MSCU1234566' }
      vi.mocked(containerRepository.findByQrCode).mockResolvedValue(mockContainer as any)

      const result = await containerService.findByQrCode('CRTS:MSCU1234566')

      expect(result).toEqual(mockContainer)
      expect(containerRepository.findByQrCode).toHaveBeenCalledWith('CRTS:MSCU1234566')
    })

    it('should fallback to container number lookup', async () => {
      const mockContainer = { containerId: 1, containerNumber: 'MSCU1234566' }
      vi.mocked(containerRepository.findByQrCode).mockResolvedValue(null)
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue(mockContainer as any)

      const result = await containerService.findByQrCode('MSCU1234566')

      expect(result).toEqual(mockContainer)
      expect(containerRepository.findByContainerNumber).toHaveBeenCalledWith('MSCU1234566')
    })

    it('should throw 404 when not found', async () => {
      vi.mocked(containerRepository.findByQrCode).mockResolvedValue(null)
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue(null)

      await expect(containerService.findByQrCode('CRTS:UNKNOWN0000'))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('createContainer', () => {
    it('should reject invalid container number', async () => {
      await expect(containerService.createContainer({
        containerNumber: 'INVALID',
        isoType: '22G1',
        containerSize: '20',
        containerCategory: 'Dry',
        owner: 'MSC',
        registrationDate: new Date(),
        status: 'Active'
      }, 'admin')).rejects.toMatchObject({ statusCode: 422 })
    })

    it('should reject duplicate container number', async () => {
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue({ containerId: 1 } as any)

      await expect(containerService.createContainer({
        containerNumber: 'MSCU1234566',
        isoType: '22G1',
        containerSize: '20',
        containerCategory: 'Dry',
        owner: 'MSC',
        registrationDate: new Date(),
        status: 'Active'
      }, 'admin')).rejects.toMatchObject({ statusCode: 409 })
    })
  })
})
