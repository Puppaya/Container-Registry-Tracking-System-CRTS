import { publicContainerService } from '../../../services/public-container.service'
import { PublicContainerTrackSchema } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const params = PublicContainerTrackSchema.parse({
    containerNumber: query.containerNumber,
    checkDigit: query.checkDigit
  })

  const result = await publicContainerService.trackContainer(
    params.containerNumber,
    params.checkDigit
  )

  return sendSuccess(result)
})
