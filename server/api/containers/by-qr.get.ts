import { containerService } from '../../services/container.service'
import { ContainerQrLookupSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const query = getQuery(event)
  const params = ContainerQrLookupSchema.parse({
    code: query.code
  })

  const container = await containerService.findByQrCode(params.code)
  return sendSuccess(container)
})
