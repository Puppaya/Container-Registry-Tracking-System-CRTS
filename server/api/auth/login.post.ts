import { z } from 'zod'
import { userService } from '../../services/user.service'
import { decryptPassword } from '../../utils/crypto'
import { validateBody } from '../../utils/validation'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

export default defineEventHandler(async (event) => {
    const { username, password: encryptedPassword } = await validateBody(event, loginSchema)

    // 1. Decrypt password received from frontend
    const password = decryptPassword(encryptedPassword)

    // 2. Authenticate via Service
    const user = await userService.authenticate(username, password)

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ถูกຕ້ອງ'
        })
    }

    // 3. Set Session
    await setUserSession(event, {
        user: {
            id: user.id,
            email: user.email,
            username: user.username || '',
            name: user.name,
            role: (user as { role?: string }).role || 'SurveyTeam'
        },
        loggedInAt: new Date()
    })

    return { success: true, message: 'ເຂົ້າສູ່ລະບົບສຳເລັດ' }
})

