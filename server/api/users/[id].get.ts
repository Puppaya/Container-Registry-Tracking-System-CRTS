import { userService } from '../../services/user.service'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))

    const user = await userService.getUserById(id)
    
    if (!user) {
        throw createError({
            statusCode: 404,
            message: 'User not found'
        })
    }

    // Exclude password from the response
    const { password, ...userWithoutPassword } = user

    return sendSuccess(userWithoutPassword, 'User retrieved successfully')
})
