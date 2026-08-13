import type { ContainerCurrentStatus } from './container-location'

const MOVEMENT_EVENT_TYPES = new Set(['GateIn', 'GateOut', 'Relocation'])
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i

export interface PublicContainerSummary {
  containerNumber: string
  isoType: string
  containerSize: string
  containerCategory: string
  owner: string
  manufacturer?: string | null
  yearBuilt?: number | null
  registrationDate: string
  status: string
  qrCode?: string | null
}

export interface PublicSurveySummary {
  surveyDate: string
  result: string
}

export interface PublicMovementSummary {
  eventType: string
  eventDate: string
  eventDescription?: string | null
}

export interface PublicTimelineEvent {
  eventType: string
  eventDate: string
  eventDescription?: string | null
}

export interface PublicContainerTrackResponse {
  container: PublicContainerSummary
  currentStatus: ContainerCurrentStatus
  latestSurvey: PublicSurveySummary | null
  recentMovements: PublicMovementSummary[]
  timeline: PublicTimelineEvent[]
  registrationReference?: string | null
}

function toIsoDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  return date.toISOString()
}

function sanitizeEventDescription(
  eventType: string,
  description?: string | null
): string | null {
  if (eventType === 'Registration') {
    return 'Container registered'
  }

  if (!description?.trim()) return null
  if (EMAIL_PATTERN.test(description)) return null
  if (description.includes('Submitter:')) return null

  if (MOVEMENT_EVENT_TYPES.has(eventType)) {
    return description.trim()
  }

  if (eventType === 'Survey') {
    return 'Survey completed'
  }

  return description.trim()
}

export function mapPublicTrackResponse(input: {
  container: {
    containerNumber: string
    isoType: string
    containerSize: string
    containerCategory: string
    owner: string
    manufacturer?: string | null
    yearBuilt?: number | null
    registrationDate: Date | string
    status: string
    qrCode?: string | null
  }
  currentStatus: ContainerCurrentStatus
  latestSurvey?: {
    surveyDate: Date | string
    result: string
  } | null
  recentMovements: Array<{
    eventType: string
    eventDate: Date | string
    eventDescription?: string | null
  }>
  timeline: Array<{
    eventType: string
    eventDate: Date | string
    eventDescription?: string | null
  }>
  registrationReference?: string | null
}): PublicContainerTrackResponse {
  return {
    container: {
      containerNumber: input.container.containerNumber,
      isoType: input.container.isoType,
      containerSize: input.container.containerSize,
      containerCategory: input.container.containerCategory,
      owner: input.container.owner,
      manufacturer: input.container.manufacturer ?? null,
      yearBuilt: input.container.yearBuilt ?? null,
      registrationDate: toIsoDate(input.container.registrationDate),
      status: input.container.status,
      qrCode: input.container.qrCode ?? null
    },
    currentStatus: input.currentStatus,
    latestSurvey: input.latestSurvey
      ? {
          surveyDate: toIsoDate(input.latestSurvey.surveyDate),
          result: input.latestSurvey.result
        }
      : null,
    recentMovements: input.recentMovements.map(movement => ({
      eventType: movement.eventType,
      eventDate: toIsoDate(movement.eventDate),
      eventDescription: sanitizeEventDescription(movement.eventType, movement.eventDescription)
    })),
    timeline: input.timeline.map(event => ({
      eventType: event.eventType,
      eventDate: toIsoDate(event.eventDate),
      eventDescription: sanitizeEventDescription(event.eventType, event.eventDescription)
    })),
    registrationReference: input.registrationReference ?? null
  }
}
