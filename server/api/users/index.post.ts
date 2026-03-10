import { userService } from '../../services/user.service'
import { decryptPassword } from '../../utils/crypto'
import { userRepository } from '../../utils/repositories'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const data = await validateRequest(event, UserSchema)

    // Check if email exists
    const existingEmail = await userRepository.findByEmail(data.email)
    if (existingEmail) {
        return sendApiError('Email already exists', 409)
    }

    // Check if username exists
    const existingUser = await userRepository.findByUsername(data.username)
    if (existingUser) {
        return sendApiError('Username already exists', 409)
    }

    // Decrypt password from frontend before passing to service
    if (data.password) {
        data.password = decryptPassword(data.password)
    }

    const user = await userService.createUser(data)
    return sendSuccess(user, 'User created successfully')
})
