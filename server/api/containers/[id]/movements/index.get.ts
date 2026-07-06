import { containerMovementService } from '../../../../services/container-movement.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const containerId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(containerId)) {
    return sendApiError('Invalid container ID', 400)
  }

  const query = validateQuery(event, MovementListQuerySchema)
  const result = await containerMovementService.getContainerMovements(containerId, query)

  return sendSuccess(result)
})
