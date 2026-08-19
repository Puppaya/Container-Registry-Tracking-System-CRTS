import { auditLogger } from './logger'
import { auditLogRepository } from './repositories'

export const ALL_AUDIT_ACTIONS = [
  'container.create',
  'container.update',
  'container.delete',
  'container.status_change',
  'container.event.create',
  'document.upload',
  'document.delete',
  'survey.sync',
  'gate.sync',
  'master_data.create',
  'master_data.update',
  'master_data.delete'
] as const

export type AuditAction = typeof ALL_AUDIT_ACTIONS[number]

export interface AuditLogEntry {
  action: AuditAction
  actor: string
  entityType: string
  entityId?: string | number
  details?: Record<string, unknown>
}

/**
 * Writes structured audit entry to console and persists to tb_audit_log.
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString()

  auditLogger.info({
    timestamp,
    ...entry
  })

  try {
    await auditLogRepository.create({
      action: entry.action,
      actor: entry.actor,
      entityType: entry.entityType,
      entityId: entry.entityId != null ? String(entry.entityId) : null,
      details: entry.details ? JSON.stringify(entry.details) : null
    })
  } catch (error) {
    auditLogger.error('Failed to persist audit log', error)
  }
}
