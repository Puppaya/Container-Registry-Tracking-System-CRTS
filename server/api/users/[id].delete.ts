import { userService } from '../../services/user.service'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))

    await userService.deleteUser(id)
    return sendSuccess(null, 'User deleted successfully')
})
