import { auditLogRepository } from '../utils/repositories'
import type { AuditLogListQuery } from '../utils/validation'

export interface AuditLogResponse {
  auditLogId: number
  action: string
  actor: string
  entityType: string
  entityId: string | null
  details: Record<string, unknown> | null
  createdDate: string
}

function mapAuditLog(record: {
  auditLogId: number
  action: string
  actor: string
  entityType: string
  entityId: string | null
  details: string | null
  createdDate: Date
}): AuditLogResponse {
  let details: Record<string, unknown> | null = null

  if (record.details) {
    try {
      details = JSON.parse(record.details) as Record<string, unknown>
    } catch {
      details = { raw: record.details }
    }
  }

  return {
    auditLogId: record.auditLogId,
    action: record.action,
    actor: record.actor,
    entityType: record.entityType,
    entityId: record.entityId,
    details,
    createdDate: record.createdDate.toISOString()
  }
}

export class AuditLogService {
  async getAuditLogs(params: AuditLogListQuery) {
    const { page, pageSize, search, action, entityType, dateFrom, dateTo } = params
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { actor: { contains: search } },
        { entityId: { contains: search } },
        { action: { contains: search } }
      ]
    }

    if (action && action !== 'all') {
      where.action = action
    }

    if (entityType && entityType !== 'all') {
      where.entityType = entityType
    }

    if (dateFrom || dateTo) {
      where.createdDate = {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {})
      }
    }

    const result = await auditLogRepository.findPaginated({
      page,
      pageSize,
      where,
      orderBy: { auditLogId: 'desc' },
      select: {
        auditLogId: true,
        action: true,
        actor: true,
        entityType: true,
        entityId: true,
        details: true,
        createdDate: true
      }
    })

    return {
      data: result.data.map(mapAuditLog),
      meta: result.meta
    }
  }

  async getAuditLog(auditLogId: number) {
    const record = await auditLogRepository.findByAuditLogId(auditLogId)
    if (!record) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Audit log not found'
      })
    }

    return mapAuditLog(record)
  }
}

export const auditLogService = new AuditLogService()
