import { containerEventService } from '../../../services/container-event.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const containerId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(containerId)) {
    return sendApiError('Invalid container ID', 400)
  }

  const filters = validateQuery(event, TimelineQuerySchema)
  const timeline = await containerEventService.getTimeline(containerId, filters)

  return sendSuccess(timeline)
})
