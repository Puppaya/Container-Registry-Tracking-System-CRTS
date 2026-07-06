export const AUDIT_ACTIONS = [
  { value: 'container.create', label: 'Container Created' },
  { value: 'container.update', label: 'Container Updated' },
  { value: 'container.delete', label: 'Container Deleted' },
  { value: 'container.status_change', label: 'Status Changed' },
  { value: 'container.event.create', label: 'Event Created' },
  { value: 'document.upload', label: 'Document Uploaded' },
  { value: 'document.delete', label: 'Document Deleted' },
  { value: 'survey.sync', label: 'Survey Synced' }
] as const

export const AUDIT_ENTITY_TYPES = [
  { value: 'container', label: 'Container' },
  { value: 'container_event', label: 'Container Event' },
  { value: 'container_document', label: 'Document' },
  { value: 'survey', label: 'Survey' }
] as const

export function getAuditActionLabel(action: string) {
  return AUDIT_ACTIONS.find(item => item.value === action)?.label || action
}

export function getAuditActionColor(action: string): 'success' | 'error' | 'warning' | 'info' | 'neutral' {
  if (action.includes('delete')) return 'error'
  if (action.includes('create') || action.includes('upload')) return 'success'
  if (action.includes('sync') || action.includes('status')) return 'warning'
  return 'info'
}

export function formatAuditDetails(details: Record<string, unknown> | null) {
  if (!details) return '—'
  return JSON.stringify(details, null, 2)
}
