import { containerMovementService } from '../../../../services/container-movement.service'
import { getActorName } from '../../../../services/container.service'

export default defineEventHandler(async (event) => {
  await requireRegistryOfficer(event)

  const { user } = await getUserSession(event)
  const containerId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(containerId)) {
    return sendApiError('Invalid container ID', 400)
  }

  const data = await validateRequest(event, CreateMovementSchema)
  const created = await containerMovementService.recordMovement(containerId, data, getActorName(user!))

  return sendSuccess(created, 'Movement recorded successfully')
})
