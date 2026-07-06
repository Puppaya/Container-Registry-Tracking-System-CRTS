import { BaseRepository } from './base-repository'
import { MOVEMENT_EVENT_TYPES } from './container-events'
import prisma from './prisma'

export class UserRepository extends BaseRepository<any> {
    constructor() {
        super(prisma.user)
    }

    // Custom logic for User
    async findByEmail(email: string) {
        return this.model.findUnique({
            where: { email }
        })
    }

    async findByUsername(username: string) {
        return this.model.findUnique({
            where: { username }
        })
    }

    async updatePassword(id: number, newPasswordHash: string) {
        return this.model.update({
            where: { id },
            data: { password: newPasswordHash }
        })
    }
}

export class ContainerRepository extends BaseRepository<any> {
    constructor() {
        super(prisma.container)
    }

    async findByContainerId(containerId: number) {
        return this.model.findUnique({
            where: { containerId }
        })
    }

    async findByContainerNumber(containerNumber: string) {
        return this.model.findUnique({
            where: { containerNumber }
        })
    }

    async findByQrCode(qrCode: string) {
        return this.model.findFirst({
            where: { qrCode }
        })
    }

    async quickSearch(term: string, limit = 10) {
        const normalized = term.trim().toUpperCase()

        return this.model.findMany({
            where: {
                OR: [
                    { containerNumber: { contains: normalized } },
                    { owner: { contains: term.trim() } },
                    { isoType: { contains: normalized } },
                    { qrCode: { contains: normalized } }
                ]
            },
            take: limit,
            orderBy: { containerNumber: 'asc' },
            select: {
                containerId: true,
                containerNumber: true,
                owner: true,
                status: true,
                isoType: true,
                containerSize: true
            }
        })
    }

    async updateByContainerId(containerId: number, data: Record<string, unknown>) {
        return this.model.update({
            where: { containerId },
            data
        })
    }

    async deleteByContainerId(containerId: number) {
        return this.model.delete({
            where: { containerId }
        })
    }

    async countAll() {
        return this.model.count()
    }

    async countByStatus(status: string) {
        return this.model.count({ where: { status } })
    }

    async countSurveyed() {
        return this.model.count({
            where: { surveys: { some: {} } }
        })
    }

    async countRequiringAttention() {
        return this.model.count({
            where: {
                OR: [
                    { status: 'Inactive' },
                    { status: 'Active', surveys: { none: {} } },
                    { surveys: { some: { result: { contains: 'Conditional' } } } }
                ]
            }
        })
    }

    async countRegisteredSince(date: Date) {
        return this.model.count({
            where: { registrationDate: { gte: date } }
        })
    }

    async groupByStatus() {
        return this.model.groupBy({
            by: ['status'],
            _count: { containerId: true }
        })
    }

    async findRegistrationDatesSince(date: Date) {
        return this.model.findMany({
            where: { registrationDate: { gte: date } },
            select: { registrationDate: true }
        })
    }

    async findForRegistryReport(filters: {
        status?: string
        dateFrom?: Date
        dateTo?: Date
    }) {
        const where: Record<string, unknown> = {}

        if (filters.status && filters.status !== 'all') {
            where.status = filters.status
        }

        if (filters.dateFrom || filters.dateTo) {
            where.registrationDate = {
                ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
                ...(filters.dateTo ? { lte: filters.dateTo } : {})
            }
        }

        return this.model.findMany({
            where,
            orderBy: { containerId: 'desc' },
            select: {
                containerNumber: true,
                isoType: true,
                containerSize: true,
                containerCategory: true,
                owner: true,
                status: true,
                registrationDate: true
            }
        })
    }

    async findForSurveyCoverageReport() {
        return this.model.findMany({
            orderBy: { containerNumber: 'asc' },
            select: {
                containerNumber: true,
                owner: true,
                status: true,
                surveys: {
                    orderBy: { surveyDate: 'desc' },
                    take: 1,
                    select: {
                        surveyDate: true,
                        result: true,
                        surveyReferenceNo: true
                    }
                }
            }
        })
    }

    async groupByField(field: 'status' | 'containerSize' | 'containerCategory') {
        return this.model.groupBy({
            by: [field],
            _count: { containerId: true }
        })
    }
}

export class ContainerEventRepository extends BaseRepository<any> {
    constructor() {
        super(prisma.containerEvent)
    }

    async findByContainerId(containerId: number, filters?: {
        eventType?: string
        dateFrom?: Date
        dateTo?: Date
    }) {
        const where: Record<string, unknown> = { containerId }

        if (filters?.eventType && filters.eventType !== 'all') {
            where.eventType = filters.eventType
        }

        if (filters?.dateFrom || filters?.dateTo) {
            where.eventDate = {
                ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
                ...(filters.dateTo ? { lte: filters.dateTo } : {})
            }
        }

        return this.model.findMany({
            where,
            orderBy: [{ eventDate: 'desc' }, { eventId: 'desc' }]
        })
    }

    async findPaginatedLifecycle(options: {
        page: number
        pageSize: number
        where?: Record<string, unknown>
    }) {
        return this.findPaginated({
            page: options.page,
            pageSize: options.pageSize,
            where: options.where,
            orderBy: [{ eventDate: 'desc' }, { eventId: 'desc' }],
            include: {
                container: {
                    select: {
                        containerId: true,
                        containerNumber: true,
                        status: true,
                        owner: true
                    }
                }
            }
        })
    }

    async findPaginatedMovements(options: {
        page: number
        pageSize: number
        where?: Record<string, unknown>
    }) {
        const where = {
            ...options.where,
            eventType: options.where?.eventType || { in: [...MOVEMENT_EVENT_TYPES] }
        }

        return this.findPaginatedLifecycle({
            page: options.page,
            pageSize: options.pageSize,
            where
        })
    }

    async findLatestMovementByContainerId(containerId: number) {
        return this.model.findFirst({
            where: {
                containerId,
                eventType: { in: [...MOVEMENT_EVENT_TYPES] }
            },
            orderBy: [{ eventDate: 'desc' }, { eventId: 'desc' }]
        })
    }

    async countMovements(where: Record<string, unknown> = {}) {
        return this.model.count({
            where: {
                ...where,
                eventType: where.eventType || { in: [...MOVEMENT_EVENT_TYPES] }
            }
        })
    }

    async groupByEventType(where?: Record<string, unknown>) {
        return this.model.groupBy({
            by: ['eventType'],
            where,
            _count: { eventId: true }
        })
    }

    async findRecentMovements(containerId: number, take = 5) {
        return this.model.findMany({
            where: {
                containerId,
                eventType: { in: ['Relocation', 'GateIn', 'GateOut'] }
            },
            orderBy: [{ eventDate: 'desc' }, { eventId: 'desc' }],
            take
        })
    }

    async countByContainerId(containerId: number) {
        return this.model.count({ where: { containerId } })
    }

    async findByExternalReferenceNo(externalReferenceNo: string) {
        return this.model.findFirst({
            where: { externalReferenceNo }
        })
    }

    async findRecentActivities(limit = 15) {
        return this.model.findMany({
            take: limit,
            orderBy: [{ eventDate: 'desc' }, { eventId: 'desc' }],
            include: {
                container: {
                    select: {
                        containerId: true,
                        containerNumber: true
                    }
                }
            }
        })
    }

    async findForLifecycleReport(filters: { dateFrom?: Date, dateTo?: Date }) {
        const where: Record<string, unknown> = {}

        if (filters.dateFrom || filters.dateTo) {
            where.eventDate = {
                ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
                ...(filters.dateTo ? { lte: filters.dateTo } : {})
            }
        }

        return this.model.findMany({
            where,
            orderBy: [{ eventDate: 'desc' }, { eventId: 'desc' }],
            include: {
                container: {
                    select: { containerNumber: true }
                }
            }
        })
    }
}

export class ContainerSurveyRepository extends BaseRepository<any> {
    constructor() {
        super(prisma.containerSurvey)
    }

    async findLatestByContainerId(containerId: number) {
        return this.model.findFirst({
            where: { containerId },
            orderBy: { surveyDate: 'desc' }
        })
    }

    async findByContainerId(containerId: number) {
        return this.model.findMany({
            where: { containerId },
            orderBy: { surveyDate: 'desc' }
        })
    }

    async findByReferenceNo(surveyReferenceNo: string) {
        return this.model.findUnique({
            where: { surveyReferenceNo }
        })
    }

    async findInspectionBySurveyId(surveyId: number) {
        return this.model.findUnique({
            where: { surveyId },
            include: {
                container: {
                    select: {
                        containerId: true,
                        containerNumber: true,
                        owner: true,
                        status: true
                    }
                }
            }
        })
    }

    async findPaginatedInspections(options: {
        page: number
        pageSize: number
        where?: Record<string, unknown>
    }) {
        return this.findPaginated({
            page: options.page,
            pageSize: options.pageSize,
            where: options.where,
            orderBy: { surveyDate: 'desc' },
            include: {
                container: {
                    select: {
                        containerId: true,
                        containerNumber: true,
                        owner: true,
                        status: true
                    }
                }
            }
        })
    }

    async groupByResult(where?: Record<string, unknown>) {
        return this.model.groupBy({
            by: ['result'],
            where,
            _count: { surveyId: true }
        })
    }
}

export class ContainerDocumentRepository extends BaseRepository<any> {
    constructor() {
        super(prisma.containerDocument)
    }

    async findRecentByContainerId(containerId: number, take = 5) {
        return this.model.findMany({
            where: { containerId },
            orderBy: { uploadedDate: 'desc' },
            take
        })
    }

    async countByContainerId(containerId: number) {
        return this.model.count({ where: { containerId } })
    }

    async findByContainerId(containerId: number) {
        return this.model.findMany({
            where: { containerId },
            orderBy: { uploadedDate: 'desc' }
        })
    }

    async findByDocumentId(documentId: number) {
        return this.model.findUnique({
            where: { documentId }
        })
    }

    async createDocument(data: {
        containerId: number
        documentType: string
        fileName: string
        fileUrl: string
        uploadedBy: string
    }) {
        return this.model.create({ data })
    }

    async deleteByDocumentId(documentId: number) {
        return this.model.delete({
            where: { documentId }
        })
    }
}

export class AuditLogRepository extends BaseRepository<any> {
    constructor() {
        super(prisma.auditLog)
    }

    async findByAuditLogId(auditLogId: number) {
        return this.model.findUnique({
            where: { auditLogId }
        })
    }
}

export class MasterDataRepository extends BaseRepository<any> {
    constructor() {
        super(prisma.masterData)
    }

    async findByMasterDataId(masterDataId: number) {
        return this.model.findUnique({
            where: { masterDataId }
        })
    }

    async findByCategoryAndCode(category: string, code: string) {
        return this.model.findUnique({
            where: {
                category_code: { category, code }
            }
        })
    }

    async findActiveByCategory(category: string) {
        return this.model.findMany({
            where: { category, isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
        })
    }

    async findAllActive() {
        return this.model.findMany({
            where: { isActive: true },
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }]
        })
    }

    async updateByMasterDataId(masterDataId: number, data: Record<string, unknown>) {
        return this.model.update({
            where: { masterDataId },
            data
        })
    }

    async deleteByMasterDataId(masterDataId: number) {
        return this.model.delete({
            where: { masterDataId }
        })
    }
}

// Export singleton instances
export const userRepository = new UserRepository()
export const containerRepository = new ContainerRepository()
export const containerEventRepository = new ContainerEventRepository()
export const containerSurveyRepository = new ContainerSurveyRepository()
export const containerDocumentRepository = new ContainerDocumentRepository()
export const auditLogRepository = new AuditLogRepository()
export const masterDataRepository = new MasterDataRepository()
