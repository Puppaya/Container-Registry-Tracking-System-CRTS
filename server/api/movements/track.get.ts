import { containerMovementService } from '../../services/container-movement.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const { q } = validateQuery(event, MovementTrackQuerySchema)
  const result = await containerMovementService.trackContainer(q)

  return sendSuccess(result)
})
