import { publicContainerService } from '../../../services/public-container.service'
import { ContainerQrLookupSchema } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const params = ContainerQrLookupSchema.parse({
    code: query.code
  })

  const result = await publicContainerService.trackByQr(params.code)
  return sendSuccess(result)
})
