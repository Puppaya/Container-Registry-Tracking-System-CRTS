import { containerService } from '../../services/container.service'
import { ContainerQuickSearchSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const query = getQuery(event)
  const params = ContainerQuickSearchSchema.parse({
    q: query.q,
    limit: query.limit
  })

  const results = await containerService.quickSearch(params.q, params.limit)
  return sendSuccess(results)
})
