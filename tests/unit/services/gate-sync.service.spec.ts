import { describe, it, expect, vi, beforeEach } from 'vitest'
import { gateSyncService } from '../../../server/services/gate-sync.service'
import { containerRepository, containerEventRepository } from '../../../server/utils/repositories'
import { logAudit } from '../../../server/utils/audit-log'

vi.mock('../../../server/utils/repositories', () => ({
  containerRepository: {
    findByContainerNumber: vi.fn()
  },
  containerEventRepository: {
    findByExternalReferenceNo: vi.fn(),
    create: vi.fn()
  }
}))

vi.mock('../../../server/utils/audit-log', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined)
}))

describe('GateSyncService', () => {
  const sampleRecord = {
    gateReferenceNo: 'GTE-2026-0001',
    containerNumber: 'MSCU1234567',
    eventType: 'GateIn' as const,
    eventDate: new Date('2026-07-01T08:00:00+07:00'),
    location: 'Main Gate 1 / Yard A',
    vehiclePlateNo: 'LA-1234'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('syncRecord', () => {
    it('should create gate event when container exists and reference is new', async () => {
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue({
        containerId: 1,
        containerNumber: 'MSCU1234567'
      } as any)
      vi.mocked(containerEventRepository.findByExternalReferenceNo).mockResolvedValue(null)
      vi.mocked(containerEventRepository.create).mockResolvedValue({ eventId: 10 } as any)

      const result = await gateSyncService.syncRecord(sampleRecord)

      expect(result.status).toBe('created')
      expect(containerEventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          containerId: 1,
          eventType: 'GateIn',
          externalReferenceNo: 'GTE-2026-0001',
          createdBy: 'smart-gate-integration'
        })
      )
    })

    it('should skip when gate reference already exists', async () => {
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue({ containerId: 1 } as any)
      vi.mocked(containerEventRepository.findByExternalReferenceNo).mockResolvedValue({ eventId: 5 } as any)

      const result = await gateSyncService.syncRecord(sampleRecord)

      expect(result.status).toBe('skipped')
      expect(result.reason).toBe('already_synced')
      expect(containerEventRepository.create).not.toHaveBeenCalled()
    })

    it('should skip when container is not registered in CRTS', async () => {
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue(null)

      const result = await gateSyncService.syncRecord(sampleRecord)

      expect(result.status).toBe('skipped')
      expect(result.reason).toBe('container_not_found')
    })
  })

  describe('syncInbound', () => {
    it('should process inbound records and return summary', async () => {
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue({ containerId: 1 } as any)
      vi.mocked(containerEventRepository.findByExternalReferenceNo).mockResolvedValue(null)
      vi.mocked(containerEventRepository.create).mockResolvedValue({ eventId: 10 } as any)

      const summary = await gateSyncService.syncInbound([sampleRecord])

      expect(summary.total).toBe(1)
      expect(summary.created).toBe(1)
    })

    it('should persist audit log with item breakdown', async () => {
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue(null)

      const summary = await gateSyncService.syncInbound([sampleRecord])

      expect(summary.skipped).toBe(1)
      expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({
        action: 'gate.sync',
        actor: 'smart-gate-integration',
        entityType: 'gate_sync',
        entityId: 'GTE-2026-0001',
        details: expect.objectContaining({
          source: 'inbound',
          total: 1,
          created: 0,
          skipped: 1,
          failed: 0,
          items: [expect.objectContaining({
            gateReferenceNo: 'GTE-2026-0001',
            status: 'skipped',
            reason: 'container_not_found'
          })]
        })
      }))
    })
  })
})
