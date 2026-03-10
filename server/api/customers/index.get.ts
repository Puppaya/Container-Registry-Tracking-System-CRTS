import { customerService } from '../../services/customer.service'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 10
    const search = query.search as string
    const status = query.status as string

    const result = await customerService.getCustomers({
        page,
        pageSize,
        search,
        status
    })

    return sendSuccess(result)
})
