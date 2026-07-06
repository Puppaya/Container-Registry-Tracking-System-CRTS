import { containerService, getActorName } from '../../services/container.service'

export default defineEventHandler(async (event) => {
  await requireRegistryOfficer(event)

  const { user } = await getUserSession(event)
  const data = await validateRequest(event, ContainerSchema)
  const container = await containerService.createContainer(data, getActorName(user!))

  return sendSuccess(container, 'Container registered successfully')
})
