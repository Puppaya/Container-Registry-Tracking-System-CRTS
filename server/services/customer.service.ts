import { customerRepository } from '../utils/repositories'

export class CustomerService {
    async getCustomers(params: { page: number; pageSize: number; search?: string; status?: string }) {
        const { page, pageSize, search, status } = params

        const where: any = {}
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { location: { contains: search } }
            ]
        }
        if (status && status !== 'all') {
            where.status = status
        }

        return await customerRepository.findPaginated({
            page,
            pageSize,
            where,
            orderBy: { id: 'desc' }
        })
    }

    async createCustomer(data: any) {
        return await customerRepository.create(data)
    }

    async updateCustomer(id: number, data: any) {
        return await customerRepository.update(id, data)
    }

    async deleteCustomer(id: number) {
        return await customerRepository.delete(id)
    }

    async getCustomer(id: number) {
        return await customerRepository.findById(id)
    }
}

export const customerService = new CustomerService()
