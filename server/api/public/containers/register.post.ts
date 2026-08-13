import { publicContainerService } from '../../../services/public-container.service'
import { PublicContainerRegisterSchema } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = PublicContainerRegisterSchema.parse(body)
  const result = await publicContainerService.registerContainer(data)

  return sendSuccess(
    result,
    'Registration request submitted successfully. A registry officer will review your request.'
  )
})
