import type { ContainerEventType } from '~/types'

export const CONTAINER_EVENT_TYPES: ContainerEventType[] = [
  'Registration',
  'Survey',
  'Repair',
  'Maintenance',
  'Relocation',
  'GateIn',
  'GateOut',
  'StatusChange'
]

export const EVENT_TYPE_LABELS: Record<ContainerEventType, string> = {
  Registration: 'Registration',
  Survey: 'Survey',
  Repair: 'Repair',
  Maintenance: 'Maintenance',
  Relocation: 'Relocation',
  GateIn: 'Gate In',
  GateOut: 'Gate Out',
  StatusChange: 'Status Change'
}

export const EVENT_TYPE_ICONS: Record<ContainerEventType, string> = {
  Registration: 'i-lucide-clipboard-plus',
  Survey: 'i-lucide-search-check',
  Repair: 'i-lucide-wrench',
  Maintenance: 'i-lucide-settings',
  Relocation: 'i-lucide-truck',
  GateIn: 'i-lucide-log-in',
  GateOut: 'i-lucide-log-out',
  StatusChange: 'i-lucide-refresh-cw'
}

export const EVENT_TYPE_COLORS: Record<ContainerEventType, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
  Registration: 'primary',
  Survey: 'primary',
  Repair: 'warning',
  Maintenance: 'neutral',
  Relocation: 'primary',
  GateIn: 'success',
  GateOut: 'error',
  StatusChange: 'warning'
}

export { formatDisplayDateTime as formatEventDate } from '~/utils/date-format'
