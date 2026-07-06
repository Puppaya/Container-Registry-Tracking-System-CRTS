import type { ContainerEventType } from '~/types'

export const MOVEMENT_TYPES: Array<{ value: ContainerEventType, label: string }> = [
  { value: 'GateIn', label: 'Gate In' },
  { value: 'GateOut', label: 'Gate Out' },
  { value: 'Relocation', label: 'Relocation' }
]

export function getMovementStatusHint(latestType: ContainerEventType | string | null | undefined) {
  if (latestType === 'GateIn') return 'In yard / facility'
  if (latestType === 'GateOut') return 'Departed facility'
  if (latestType === 'Relocation') return 'Relocated'
  return 'No movement recorded'
}
