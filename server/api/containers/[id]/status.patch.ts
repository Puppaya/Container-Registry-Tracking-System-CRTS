import { containerService, getActorName } from '../../../services/container.service'

export default defineEventHandler(async (event) => {
  await requireRegistryOfficer(event)

  const { user } = await getUserSession(event)
  const containerId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(containerId)) {
    return sendApiError('Invalid container ID', 400)
  }

  const { status } = await validateRequest(event, ContainerStatusSchema)
  const container = await containerService.updateStatus(containerId, status, getActorName(user!))

  return sendSuccess(container, `Container ${status === 'Active' ? 'activated' : 'deactivated'} successfully`)
})
