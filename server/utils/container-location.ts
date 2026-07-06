import type { ContainerEventType } from './container-events'

export type ContainerLocationSource = 'movement' | 'registry' | 'unknown'

export interface ContainerCurrentStatus {
  operationalStatus: 'Active' | 'Inactive'
  currentLocation: string | null
  locationSource: ContainerLocationSource
  lastMovementType: Extract<ContainerEventType, 'GateIn' | 'GateOut' | 'Relocation'> | null
  lastUpdated: string | null
}

interface LatestMovementInput {
  eventType: string
  eventDescription?: string | null
  eventDate: Date
}

export function resolveCurrentStatus(
  operationalStatus: 'Active' | 'Inactive',
  latestMovement: LatestMovementInput | null | undefined,
  registryLocation?: string | null
): ContainerCurrentStatus {
  if (latestMovement && isMovementEventType(latestMovement.eventType)) {
    const location = latestMovement.eventDescription?.trim() || null

    return {
      operationalStatus,
      currentLocation: location,
      locationSource: 'movement',
      lastMovementType: latestMovement.eventType,
      lastUpdated: latestMovement.eventDate.toISOString()
    }
  }

  const registry = registryLocation?.trim()
  if (registry) {
    return {
      operationalStatus,
      currentLocation: registry,
      locationSource: 'registry',
      lastMovementType: null,
      lastUpdated: null
    }
  }

  return {
    operationalStatus,
    currentLocation: null,
    locationSource: 'unknown',
    lastMovementType: null,
    lastUpdated: null
  }
}

function isMovementEventType(
  eventType: string
): eventType is Extract<ContainerEventType, 'GateIn' | 'GateOut' | 'Relocation'> {
  return eventType === 'GateIn' || eventType === 'GateOut' || eventType === 'Relocation'
}
