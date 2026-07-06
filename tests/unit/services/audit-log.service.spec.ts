import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auditLogService } from '../../../server/services/audit-log.service'
import { auditLogRepository } from '../../../server/utils/repositories'

vi.mock('../../../server/utils/repositories', () => ({
  auditLogRepository: {
    findPaginated: vi.fn(),
    findByAuditLogId: vi.fn()
  }
}))

describe('AuditLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAuditLogs', () => {
    it('should return mapped paginated audit logs', async () => {
      vi.mocked(auditLogRepository.findPaginated).mockResolvedValue({
        data: [{
          auditLogId: 1,
          action: 'container.create',
          actor: 'registry',
          entityType: 'container',
          entityId: '42',
          details: JSON.stringify({ containerNumber: 'MSCU1234567' }),
          createdDate: new Date('2026-06-29T10:00:00.000Z')
        }],
        meta: { total: 1, page: 1, pageSize: 20, totalPages: 1 }
      } as any)

      const result = await auditLogService.getAuditLogs({
        page: 1,
        pageSize: 20
      })

      expect(result.data[0].auditLogId).toBe(1)
      expect(result.data[0].details).toEqual({ containerNumber: 'MSCU1234567' })
      expect(result.meta.total).toBe(1)
    })

    it('should apply action and date filters', async () => {
      vi.mocked(auditLogRepository.findPaginated).mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 }
      } as any)

      const dateFrom = new Date('2026-06-01')
      const dateTo = new Date('2026-06-30')

      await auditLogService.getAuditLogs({
        page: 1,
        pageSize: 20,
        action: 'container.create',
        entityType: 'container',
        dateFrom,
        dateTo
      })

      expect(auditLogRepository.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            action: 'container.create',
            entityType: 'container',
            createdDate: { gte: dateFrom, lte: dateTo }
          })
        })
      )
    })
  })

  describe('getAuditLog', () => {
    it('should return single mapped record', async () => {
      vi.mocked(auditLogRepository.findByAuditLogId).mockResolvedValue({
        auditLogId: 5,
        action: 'document.upload',
        actor: 'registry',
        entityType: 'container_document',
        entityId: '10',
        details: null,
        createdDate: new Date('2026-06-29T12:00:00.000Z')
      } as any)

      const result = await auditLogService.getAuditLog(5)

      expect(result.auditLogId).toBe(5)
      expect(result.details).toBeNull()
    })

    it('should throw 404 when not found', async () => {
      vi.mocked(auditLogRepository.findByAuditLogId).mockResolvedValue(null)

      await expect(auditLogService.getAuditLog(999))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })
})
