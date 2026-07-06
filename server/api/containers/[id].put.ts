import { containerService, getActorName } from '../../services/container.service'

export default defineEventHandler(async (event) => {
  await requireRegistryOfficer(event)

  const { user } = await getUserSession(event)
  const containerId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(containerId)) {
    return sendApiError('Invalid container ID', 400)
  }

  const data = await validateRequest(event, ContainerUpdateSchema)
  const container = await containerService.updateContainer(containerId, data, getActorName(user!))

  return sendSuccess(container, 'Container updated successfully')
})
