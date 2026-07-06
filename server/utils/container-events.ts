export const CONTAINER_EVENT_TYPES = [
  'Registration',
  'Survey',
  'Repair',
  'Maintenance',
  'Relocation',
  'GateIn',
  'GateOut',
  'StatusChange'
] as const

export type ContainerEventType = typeof CONTAINER_EVENT_TYPES[number]

export const MANUAL_EVENT_TYPES = [
  'Repair',
  'Maintenance',
  'Relocation',
  'GateIn',
  'GateOut'
] as const satisfies readonly ContainerEventType[]

export const MOVEMENT_EVENT_TYPES = [
  'Relocation',
  'GateIn',
  'GateOut'
] as const satisfies readonly ContainerEventType[]
