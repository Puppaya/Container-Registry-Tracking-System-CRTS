import { describe, it, expect, vi, beforeEach } from 'vitest'
import { publicContainerService } from '../../../server/services/public-container.service'
import {
  containerRepository,
  containerEventRepository,
  containerSurveyRepository
} from '../../../server/utils/repositories'

vi.mock('../../../server/utils/prisma', () => ({
  default: {
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      container: {
        create: vi.fn().mockResolvedValue({
          containerId: 1,
          containerNumber: 'MSCU1234566',
          registrationDate: new Date('2026-01-01'),
          status: 'Pending'
        })
      },
      containerEvent: {
        create: vi.fn().mockResolvedValue({})
      }
    }))
  }
}))

vi.mock('../../../server/utils/repositories', () => ({
  containerRepository: {
    findByContainerNumber: vi.fn(),
    findByContainerId: vi.fn(),
    findByQrCode: vi.fn()
  },
  containerEventRepository: {
    findRecentMovements: vi.fn(),
    findLatestMovementByContainerId: vi.fn(),
    findByContainerId: vi.fn()
  },
  containerSurveyRepository: {
    findLatestByContainerId: vi.fn()
  }
}))

vi.mock('../../../server/utils/audit-log', () => ({
  logAudit: vi.fn()
}))

describe('PublicContainerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registerContainer', () => {
    it('should reject invalid container numbers', async () => {
      await expect(publicContainerService.registerContainer({
        containerPrefix: 'BAD123',
        checkDigit: '1',
        isoType: '42G1',
        containerSize: '40',
        containerCategory: 'Dry',
        owner: 'ACME',
        registrationDate: new Date('2026-01-01'),
        submitterName: 'Jane',
        submitterEmail: 'jane@example.com',
        certified: true
      })).rejects.toMatchObject({ statusCode: 422 })
    })

    it('should reject duplicate container numbers', async () => {
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue({ containerId: 1 } as any)

      await expect(publicContainerService.registerContainer({
        containerPrefix: 'MSCU123456',
        checkDigit: '6',
        isoType: '42G1',
        containerSize: '40',
        containerCategory: 'Dry',
        owner: 'ACME',
        registrationDate: new Date('2026-01-01'),
        submitterName: 'Jane',
        submitterEmail: 'jane@example.com',
        certified: true
      })).rejects.toMatchObject({ statusCode: 409 })
    })
  })

  describe('trackContainer', () => {
    it('should return 404 when check digit does not match', async () => {
      await expect(
        publicContainerService.trackContainer('MSCU1234566', '0')
      ).rejects.toMatchObject({ statusCode: 404 })
    })

    it('should return public track response when container exists', async () => {
      const mockContainer = {
        containerId: 1,
        containerNumber: 'MSCU1234566',
        isoType: '42G1',
        containerSize: '40',
        containerCategory: 'Dry',
        owner: 'ACME',
        registrationDate: new Date('2026-01-01'),
        status: 'Active',
        registryLocation: 'Main Yard'
      } as any

      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue(mockContainer)
      vi.mocked(containerRepository.findByContainerId).mockResolvedValue(mockContainer)
      vi.mocked(containerSurveyRepository.findLatestByContainerId).mockResolvedValue(null)
      vi.mocked(containerEventRepository.findRecentMovements).mockResolvedValue([])
      vi.mocked(containerEventRepository.findLatestMovementByContainerId).mockResolvedValue(null)
      vi.mocked(containerEventRepository.findByContainerId).mockResolvedValue([])

      const result = await publicContainerService.trackContainer('MSCU1234566', '6')

      expect(result.container.containerNumber).toBe('MSCU1234566')
      expect(result.timeline).toEqual([])
    })
  })
})
