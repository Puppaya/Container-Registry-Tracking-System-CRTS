export const AUDIT_ACTIONS = [
  { value: 'container.create', labelKey: 'audit.actions.containerCreate' },
  { value: 'container.update', labelKey: 'audit.actions.containerUpdate' },
  { value: 'container.delete', labelKey: 'audit.actions.containerDelete' },
  { value: 'container.status_change', labelKey: 'audit.actions.containerStatusChange' },
  { value: 'container.event.create', labelKey: 'audit.actions.containerEventCreate' },
  { value: 'document.upload', labelKey: 'audit.actions.documentUpload' },
  { value: 'document.delete', labelKey: 'audit.actions.documentDelete' },
  { value: 'survey.sync', labelKey: 'audit.actions.surveySync' },
  { value: 'gate.sync', labelKey: 'audit.actions.gateSync' },
  { value: 'master_data.create', labelKey: 'audit.actions.masterDataCreate' },
  { value: 'master_data.update', labelKey: 'audit.actions.masterDataUpdate' },
  { value: 'master_data.delete', labelKey: 'audit.actions.masterDataDelete' }
] as const

export const AUDIT_ENTITY_TYPES = [
  { value: 'container', labelKey: 'audit.entities.container' },
  { value: 'container_event', labelKey: 'audit.entities.containerEvent' },
  { value: 'container_document', labelKey: 'audit.entities.document' },
  { value: 'survey', labelKey: 'audit.entities.survey' },
  { value: 'gate_sync', labelKey: 'audit.entities.gateSync' },
  { value: 'master_data', labelKey: 'audit.entities.masterData' }
] as const

export interface AuditSyncItem {
  gateReferenceNo?: string
  surveyReferenceNo?: string
  containerNumber: string
  status: 'created' | 'skipped' | 'failed'
  reason?: string
}

export function getAuditActionLabel(action: string, t?: (key: string) => string) {
  const item = AUDIT_ACTIONS.find(entry => entry.value === action)
  if (item && t) return t(item.labelKey)
  return item?.value || action
}

export function getAuditEntityTypeLabel(entityType: string, t?: (key: string) => string) {
  const item = AUDIT_ENTITY_TYPES.find(entry => entry.value === entityType)
  if (item && t) return t(item.labelKey)
  return item?.value || entityType
}

export function getAuditActionColor(action: string): 'success' | 'error' | 'warning' | 'info' | 'neutral' {
  if (action.includes('delete')) return 'error'
  if (action.includes('create') || action.includes('upload')) return 'success'
  if (action.includes('sync') || action.includes('status')) return 'warning'
  return 'info'
}

export function isAuditSyncDetails(details: Record<string, unknown> | null): details is Record<string, unknown> & {
  total: number
  created: number
  skipped: number
  failed: number
} {
  return !!details
    && typeof details.total === 'number'
    && typeof details.created === 'number'
    && typeof details.skipped === 'number'
    && typeof details.failed === 'number'
}

export function getAuditSyncItems(details: Record<string, unknown> | null): AuditSyncItem[] {
  if (!details || !Array.isArray(details.items)) return []
  return details.items as AuditSyncItem[]
}

export function getAuditSyncStatusColor(status: AuditSyncItem['status']): 'success' | 'warning' | 'error' {
  if (status === 'created') return 'success'
  if (status === 'failed') return 'error'
  return 'warning'
}

export function getAuditSyncReasonLabel(reason: string | undefined, t: (key: string) => string) {
  if (!reason) return '—'

  const key = `audit.syncReasons.${reason}`
  const translated = t(key)
  return translated === key ? reason : translated
}

export function formatAuditDetails(details: Record<string, unknown> | null) {
  if (!details) return '—'
  return JSON.stringify(details, null, 2)
}

export function getAuditDetailEntries(details: Record<string, unknown> | null) {
  if (!details || isAuditSyncDetails(details)) return []

  return Object.entries(details).filter(([key]) => key !== 'items')
}
