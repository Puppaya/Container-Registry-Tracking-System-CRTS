import {
  containerRepository,
  containerEventRepository
} from '../utils/repositories'
import { MOVEMENT_EVENT_TYPES } from '../utils/container-events'
import { resolveContainerNumberInput } from '../utils/container-validation'
import { containerEventService } from './container-event.service'
import type { CreateMovementInput, MovementListQuery } from '../utils/validation'

export interface MovementEventResponse {
  eventId: number
  containerId: number
  containerNumber: string | null
  containerStatus?: string | null
  containerOwner?: string | null
  eventType: string
  eventDescription: string | null
  eventDate: string
  createdBy: string
  createdDate: string
}

export interface MovementSummaryResponse {
  totalMovements: number
  recentMovements: number
  gateInCount: number
  gateOutCount: number
  relocationCount: number
}

export interface MovementTrackResponse {
  container: {
    containerId: number
    containerNumber: string
    isoType: string
    containerSize: string
    containerCategory: string
    owner: string
    status: string
  }
  latestMovement: MovementEventResponse | null
  recentMovements: MovementEventResponse[]
}

function mapMovementEvent(event: {
  eventId: number
  containerId: number
  eventType: string
  eventDescription?: string | null
  eventDate: Date
  createdBy: string
  createdDate: Date
  container?: {
    containerNumber?: string
    status?: string
    owner?: string
  } | null
}): MovementEventResponse {
  return {
    eventId: event.eventId,
    containerId: event.containerId,
    containerNumber: event.container?.containerNumber ?? null,
    containerStatus: event.container?.status ?? null,
    containerOwner: event.container?.owner ?? null,
    eventType: event.eventType,
    eventDescription: event.eventDescription ?? null,
    eventDate: event.eventDate.toISOString(),
    createdBy: event.createdBy,
    createdDate: event.createdDate.toISOString()
  }
}

function buildMovementWhere(params: Pick<MovementListQuery, 'search' | 'movementType' | 'containerId' | 'owner' | 'dateFrom' | 'dateTo'>) {
  const where: Record<string, unknown> = {
    eventType: params.movementType && params.movementType !== 'all'
      ? params.movementType
      : { in: [...MOVEMENT_EVENT_TYPES] }
  }

  if (params.containerId) {
    where.containerId = params.containerId
  }

  if (params.dateFrom || params.dateTo) {
    where.eventDate = {
      ...(params.dateFrom ? { gte: params.dateFrom } : {}),
      ...(params.dateTo ? { lte: params.dateTo } : {})
    }
  }

  if (params.owner) {
    where.container = { owner: { contains: params.owner } }
  }

  if (params.search) {
    where.OR = [
      { eventDescription: { contains: params.search } },
      { createdBy: { contains: params.search } },
      { container: { containerNumber: { contains: params.search.toUpperCase() } } }
    ]
  }

  return where
}

function countByType(groups: Array<{ eventType: string, _count: { eventId: number } }>, type: string) {
  return groups.find(item => item.eventType === type)?._count.eventId ?? 0
}

export class ContainerMovementService {
  async getMovements(params: MovementListQuery) {
    const { page, pageSize, ...filters } = params
    const where = buildMovementWhere(filters)

    const result = await containerEventRepository.findPaginatedMovements({
      page,
      pageSize,
      where
    })

    return {
      data: result.data.map((event: Parameters<typeof mapMovementEvent>[0]) => mapMovementEvent(event)),
      meta: result.meta
    }
  }

  async getMovementSummary(containerId?: number): Promise<MovementSummaryResponse> {
    const baseWhere: Record<string, unknown> = {
      eventType: { in: [...MOVEMENT_EVENT_TYPES] }
    }

    if (containerId) {
      baseWhere.containerId = containerId
    }

    const since = new Date()
    since.setDate(since.getDate() - 7)

    const recentWhere = {
      ...baseWhere,
      eventDate: { gte: since }
    }

    const [totalMovements, recentMovements, groups] = await Promise.all([
      containerEventRepository.countMovements(baseWhere),
      containerEventRepository.countMovements(recentWhere),
      containerEventRepository.groupByEventType(baseWhere)
    ])

    return {
      totalMovements,
      recentMovements,
      gateInCount: countByType(groups, 'GateIn'),
      gateOutCount: countByType(groups, 'GateOut'),
      relocationCount: countByType(groups, 'Relocation')
    }
  }

  async getContainerMovements(containerId: number, params: Omit<MovementListQuery, 'containerId'>) {
    return this.getMovements({ ...params, containerId })
  }

  async trackContainer(query: string): Promise<MovementTrackResponse> {
    const trimmed = query.trim()
    const normalizedNumber = resolveContainerNumberInput(trimmed)

    let container = await containerRepository.findByContainerNumber(normalizedNumber)

    if (!container) {
      const matches = await containerRepository.quickSearch(trimmed, 1)
      if (matches.length > 0) {
        container = await containerRepository.findByContainerId(matches[0].containerId)
      }
    }

    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found for tracking'
      })
    }

    const [latestMovement, recentMovements] = await Promise.all([
      containerEventRepository.findLatestMovementByContainerId(container.containerId),
      containerEventRepository.findRecentMovements(container.containerId, 10)
    ])

    return {
      container: {
        containerId: container.containerId,
        containerNumber: container.containerNumber,
        isoType: container.isoType,
        containerSize: container.containerSize,
        containerCategory: container.containerCategory,
        owner: container.owner,
        status: container.status
      },
      latestMovement: latestMovement
        ? mapMovementEvent({ ...latestMovement, container })
        : null,
      recentMovements: recentMovements.map((event: Parameters<typeof mapMovementEvent>[0]) =>
        mapMovementEvent({ ...event, container })
      )
    }
  }

  async recordMovement(containerId: number, data: CreateMovementInput, actor: string) {
    return containerEventService.createEvent(containerId, data, actor)
  }
}

export const containerMovementService = new ContainerMovementService()
