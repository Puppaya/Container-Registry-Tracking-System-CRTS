import { containerService, getActorName } from '../../services/container.service'

export default defineEventHandler(async (event) => {
  await requireAdministrator(event)

  const { user } = await getUserSession(event)
  const actor = getActorName(user!)

  const containerId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(containerId)) {
    return sendApiError('Invalid container ID', 400)
  }

  await containerService.deleteContainer(containerId, actor)
  return sendSuccess(null, 'Container deleted successfully')
})
