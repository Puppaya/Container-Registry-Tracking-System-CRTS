import { z } from 'zod'
import { hubAuthService } from '../../services/hub-auth.service'
import { validateBody } from '../../utils/validation'

const hubExchangeSchema = z.object({
  code: z.string().min(16)
})

export default defineEventHandler(async (event) => {
  const { code } = await validateBody(event, hubExchangeSchema)
  const user = await hubAuthService.exchangeLaunchCode(code)

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      username: user.username || '',
      name: user.name || user.email.split('@')[0],
      role: user.role || 'SurveyTeam'
    },
    loggedInAt: new Date()
  })

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role
    }
  }
})
