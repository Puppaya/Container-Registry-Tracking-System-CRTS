import { containerMovementService } from '../../services/container-movement.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const query = getQuery(event)
  const containerId = query.containerId ? Number(query.containerId) : undefined

  if (query.containerId && Number.isNaN(containerId)) {
    return sendApiError('Invalid container ID', 400)
  }

  const summary = await containerMovementService.getMovementSummary(containerId)
  return sendSuccess(summary)
})
