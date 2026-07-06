import { containerEventService } from '../../services/container-event.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const query = validateQuery(event, LifecycleListQuerySchema)
  const result = await containerEventService.getLifecycleEvents(query)

  return sendSuccess(result)
})
