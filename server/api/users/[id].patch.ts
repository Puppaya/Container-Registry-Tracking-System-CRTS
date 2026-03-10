import { userService } from '../../services/user.service'
import { decryptPassword } from '../../utils/crypto'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    const data = await validateRequest(event, UserUpdateSchema)

    // Decrypt password from frontend if provided
    if (data.password) {
        data.password = decryptPassword(data.password)
    }

    const user = await userService.updateUser(id, data)
    return sendSuccess(user, 'User updated successfully')
})
