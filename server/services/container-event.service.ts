import { containerRepository, containerEventRepository } from '../utils/repositories'
import { logAudit } from '../utils/audit-log'
import type {
  CreateContainerEventInput,
  LifecycleListQuery,
  TimelineQuery
} from '../utils/validation'

export interface LifecycleEventResponse {
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

export interface LifecycleSummaryResponse {
  totalEvents: number
  byEventType: Array<{ eventType: string, count: number }>
}

function mapLifecycleEvent(event: {
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
}): LifecycleEventResponse {
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

function buildLifecycleWhere(params: Pick<LifecycleListQuery, 'search' | 'eventType' | 'containerId' | 'dateFrom' | 'dateTo'>) {
  const where: Record<string, unknown> = {}

  if (params.containerId) {
    where.containerId = params.containerId
  }

  if (params.eventType && params.eventType !== 'all') {
    where.eventType = params.eventType
  }

  if (params.dateFrom || params.dateTo) {
    where.eventDate = {
      ...(params.dateFrom ? { gte: params.dateFrom } : {}),
      ...(params.dateTo ? { lte: params.dateTo } : {})
    }
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

export class ContainerEventService {
  async getTimeline(containerId: number, filters: TimelineQuery = {}) {
    const container = await containerRepository.findByContainerId(containerId)
    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    const events = await containerEventRepository.findByContainerId(containerId, filters)
    return {
      container,
      events: events.map((event: Parameters<typeof mapLifecycleEvent>[0]) =>
        mapLifecycleEvent({ ...event, container })
      )
    }
  }

  async getLifecycleEvents(params: LifecycleListQuery) {
    const { page, pageSize, ...filters } = params
    const where = buildLifecycleWhere(filters)

    const result = await containerEventRepository.findPaginatedLifecycle({
      page,
      pageSize,
      where
    })

    return {
      data: result.data.map((event: Parameters<typeof mapLifecycleEvent>[0]) => mapLifecycleEvent(event)),
      meta: result.meta
    }
  }

  async getLifecycleSummary(containerId?: number): Promise<LifecycleSummaryResponse> {
    const where = containerId ? { containerId } : undefined
    const [totalEvents, groups] = await Promise.all([
      containerEventRepository.count(where),
      containerEventRepository.groupByEventType(where)
    ])

    return {
      totalEvents,
      byEventType: groups.map((item: { eventType: string, _count: { eventId: number } }) => ({
        eventType: item.eventType,
        count: item._count.eventId
      }))
    }
  }

  async createEvent(containerId: number, data: CreateContainerEventInput, actor: string) {
    const container = await containerRepository.findByContainerId(containerId)
    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    const event = await containerEventRepository.create({
      containerId,
      eventType: data.eventType,
      eventDescription: data.eventDescription,
      eventDate: data.eventDate,
      createdBy: actor
    })

    await logAudit({
      action: 'container.event.create',
      actor,
      entityType: 'container_event',
      entityId: event.eventId,
      details: {
        containerId,
        eventType: data.eventType
      }
    })

    return mapLifecycleEvent({ ...event, container })
  }
}

export const containerEventService = new ContainerEventService()
