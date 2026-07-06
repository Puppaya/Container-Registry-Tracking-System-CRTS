import { containerMovementService } from '../../services/container-movement.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const query = validateQuery(event, MovementListQuerySchema)
  const result = await containerMovementService.getMovements(query)

  return sendSuccess(result)
})
