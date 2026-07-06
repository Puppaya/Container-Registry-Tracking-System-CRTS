import { describe, it, expect, vi, beforeEach } from 'vitest'

const { infoMock, errorMock, createMock } = vi.hoisted(() => ({
  infoMock: vi.fn(),
  errorMock: vi.fn(),
  createMock: vi.fn().mockResolvedValue({ auditLogId: 1 })
}))

vi.mock('../../../server/utils/logger', () => ({
  auditLogger: {
    info: infoMock,
    error: errorMock
  }
}))

vi.mock('../../../server/utils/repositories', () => ({
  auditLogRepository: {
    create: createMock
  }
}))

import { logAudit } from '../../../server/utils/audit-log'

describe('audit-log', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should write structured audit entry and persist to database', async () => {
    await logAudit({
      action: 'container.create',
      actor: 'registry',
      entityType: 'container',
      entityId: 42,
      details: { containerNumber: 'MSCU1234567' }
    })

    expect(infoMock).toHaveBeenCalledOnce()
    const payload = infoMock.mock.calls[0][0]
    expect(payload.action).toBe('container.create')
    expect(payload.actor).toBe('registry')
    expect(payload.entityType).toBe('container')
    expect(payload.entityId).toBe(42)
    expect(payload.details).toEqual({ containerNumber: 'MSCU1234567' })
    expect(payload.timestamp).toBeDefined()

    expect(createMock).toHaveBeenCalledWith({
      action: 'container.create',
      actor: 'registry',
      entityType: 'container',
      entityId: '42',
      details: JSON.stringify({ containerNumber: 'MSCU1234567' })
    })
  })

  it('should log error when persistence fails without throwing', async () => {
    createMock.mockRejectedValueOnce(new Error('db down'))

    await expect(logAudit({
      action: 'survey.sync',
      actor: 'admin',
      entityType: 'survey',
      details: { total: 1 }
    })).resolves.toBeUndefined()

    expect(errorMock).toHaveBeenCalled()
  })
})
