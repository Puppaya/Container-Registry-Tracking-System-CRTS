import { customerService } from '../../services/customer.service'

export default defineEventHandler(async (event) => {
    const { user } = await getUserSession(event)
    if (!user || (user as any).role !== 'ADMIN') {
        return sendApiError('Only admins can delete customers', 403)
    }

    const id = Number(getRouterParam(event, 'id'))

    await customerService.deleteCustomer(id)
    return sendSuccess(null, 'Customer deleted successfully')
})
