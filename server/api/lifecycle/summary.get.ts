import { containerEventService } from '../../services/container-event.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const query = getQuery(event)
  const containerId = query.containerId ? Number(query.containerId) : undefined

  if (query.containerId && Number.isNaN(containerId)) {
    return sendApiError('Invalid container ID', 400)
  }

  const summary = await containerEventService.getLifecycleSummary(containerId)
  return sendSuccess(summary)
})
