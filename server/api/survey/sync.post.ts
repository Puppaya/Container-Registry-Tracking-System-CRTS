import { z } from 'zod'
import { surveySyncService } from '../../services/survey-sync.service'
import { getActorName } from '../../services/container.service'

const surveySyncBodySchema = z.object({
  containerId: z.coerce.number().int().positive().optional(),
  containerNumber: z.string().min(4).optional()
})

export default defineEventHandler(async (event) => {
  await requireRegistryOfficer(event)

  const rawBody = await readBody(event).catch(() => ({}))
  const body = surveySyncBodySchema.parse(rawBody ?? {})
  const actor = getActorName((await getUserSession(event)).user!)

  const summary = await withIdempotency(event, async () => {
    if (body.containerId) {
      return surveySyncService.syncByContainerId(body.containerId, actor)
    }

    if (body.containerNumber) {
      return surveySyncService.syncAll(actor, body.containerNumber)
    }

    return surveySyncService.syncAll(actor)
  })

  return sendSuccess(summary, 'Survey sync completed')
})
