import { containerService } from '../../services/container.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const containerId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(containerId)) {
    return sendApiError('Invalid container ID', 400)
  }

  const container = await containerService.getContainer(containerId)
  if (!container) {
    return sendApiError('Container not found', 404)
  }

  return sendSuccess(container)
})
