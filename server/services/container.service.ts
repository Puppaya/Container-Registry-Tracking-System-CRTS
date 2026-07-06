import prisma from '../utils/prisma'
import {
  containerRepository,
  containerDocumentRepository,
  containerEventRepository,
  containerSurveyRepository
} from '../utils/repositories'
import {
  validateContainerNumber,
  resolveContainerNumberInput
} from '../utils/container-validation'
import { buildContainerQrContent, parseQrScanInput } from '../utils/qr-code'
import { resolveCurrentStatus } from '../utils/container-location'
import { withDocumentPublicUrl } from '../utils/storage/public-url'
import { logAudit } from '../utils/audit-log'
import { surveyInspectionService } from './survey-inspection.service'
import type {
  CreateContainerInput,
  ContainerListQuery,
  UpdateContainerInput
} from '../utils/validation'

function getActorName(user: { username?: string, name?: string, email?: string }): string {
  return user.username || user.name || user.email || 'system'
}

export class ContainerService {
  async getContainers(params: ContainerListQuery) {
    const {
      page,
      pageSize,
      search,
      status,
      owner,
      isoType,
      containerCategory,
      containerSize,
      surveyStatus,
      registrationDateFrom,
      registrationDateTo
    } = params

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { containerNumber: { contains: search.toUpperCase() } },
        { owner: { contains: search } },
        { isoType: { contains: search.toUpperCase() } },
        { manufacturer: { contains: search } },
        { qrCode: { contains: search.toUpperCase() } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (owner) {
      where.owner = { contains: owner }
    }

    if (isoType) {
      where.isoType = isoType
    }

    if (containerCategory) {
      where.containerCategory = containerCategory
    }

    if (containerSize) {
      where.containerSize = containerSize
    }

    if (registrationDateFrom || registrationDateTo) {
      where.registrationDate = {
        ...(registrationDateFrom ? { gte: registrationDateFrom } : {}),
        ...(registrationDateTo ? { lte: registrationDateTo } : {})
      }
    }

    if (surveyStatus && surveyStatus !== 'all') {
      if (surveyStatus === 'surveyed') {
        where.surveys = { some: {} }
      } else if (surveyStatus === 'not_surveyed') {
        where.surveys = { none: {} }
      } else if (surveyStatus === 'pass') {
        where.surveys = {
          some: {
            result: { contains: 'Pass' }
          }
        }
      } else if (surveyStatus === 'conditional') {
        where.surveys = {
          some: {
            result: { contains: 'Conditional' }
          }
        }
      }
    }

    return containerRepository.findPaginated({
      page,
      pageSize,
      where,
      orderBy: { containerId: 'desc' },
      select: {
        containerId: true,
        containerNumber: true,
        isoType: true,
        containerSize: true,
        containerCategory: true,
        owner: true,
        manufacturer: true,
        yearBuilt: true,
        tareWeight: true,
        maxPayload: true,
        internalVolume: true,
        leaseProvider: true,
        registryLocation: true,
        cscExpiryDate: true,
        registrationDate: true,
        status: true,
        qrCode: true,
        createdBy: true,
        createdDate: true,
        updatedBy: true,
        updatedDate: true
      }
    })
  }

  async quickSearch(query: string, limit = 10) {
    const term = query.trim()
    if (!term) {
      return []
    }

    return containerRepository.quickSearch(term, limit)
  }

  async findByQrCode(code: string) {
    const { containerNumber, qrContent } = parseQrScanInput(code)

    let container = await containerRepository.findByQrCode(qrContent)
    if (!container) {
      container = await containerRepository.findByContainerNumber(containerNumber)
    }

    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found for this QR code'
      })
    }

    return container
  }

  async getContainer(containerId: number) {
    return containerRepository.findByContainerId(containerId)
  }

  async getProfile(containerId: number) {
    const container = await containerRepository.findByContainerId(containerId)
    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    const [
      latestSurveyFromDb,
      recentMovements,
      latestMovement,
      documents,
      documentCount,
      eventCount
    ] = await Promise.all([
      containerSurveyRepository.findLatestByContainerId(containerId),
      containerEventRepository.findRecentMovements(containerId),
      containerEventRepository.findLatestMovementByContainerId(containerId),
      containerDocumentRepository.findRecentByContainerId(containerId),
      containerDocumentRepository.countByContainerId(containerId),
      containerEventRepository.countByContainerId(containerId)
    ])

    let latestSurvey = latestSurveyFromDb
    let surveyDataSource: 'database' | 'mock' = 'database'

    if (!latestSurveyFromDb) {
      const inspection = await surveyInspectionService.getInspectionRecords({
        page: 1,
        pageSize: 1,
        containerId
      })
      const mockOrFallback = inspection.data[0]
      if (mockOrFallback) {
        latestSurvey = {
          surveyId: mockOrFallback.surveyId,
          containerId,
          surveyReferenceNo: mockOrFallback.surveyReferenceNo,
          surveyDate: mockOrFallback.surveyDate,
          inspector: mockOrFallback.inspector,
          result: mockOrFallback.result,
          damageSummary: mockOrFallback.damageSummary,
          reportUrl: mockOrFallback.reportUrl,
          createdDate: mockOrFallback.createdDate,
          isMock: mockOrFallback.isMock
        }
        surveyDataSource = inspection.meta.dataSource
      }
    }

    return {
      container,
      currentStatus: resolveCurrentStatus(
        container.status as 'Active' | 'Inactive',
        latestMovement,
        container.registryLocation
      ),
      latestSurvey,
      surveyDataSource,
      recentMovements,
      documents: documents.map(doc => withDocumentPublicUrl(doc)),
      documentCount,
      eventCount
    }
  }

  async createContainer(data: CreateContainerInput, actor: string) {
    const resolvedNumber = resolveContainerNumberInput(data.containerNumber)
    const validation = validateContainerNumber(resolvedNumber)
    if (!validation.valid) {
      throw createError({
        statusCode: 422,
        statusMessage: validation.error || 'Invalid container number'
      })
    }

    const containerNumber = validation.normalized
    const existing = await containerRepository.findByContainerNumber(containerNumber)
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Container number already exists'
      })
    }

    return prisma.$transaction(async (tx) => {
      const container = await tx.container.create({
        data: {
          containerNumber,
          isoType: data.isoType,
          containerSize: data.containerSize,
          containerCategory: data.containerCategory,
          owner: data.owner,
          manufacturer: data.manufacturer,
          yearBuilt: data.yearBuilt,
          tareWeight: data.tareWeight,
          maxPayload: data.maxPayload,
          internalVolume: data.internalVolume,
          leaseProvider: data.leaseProvider,
          registryLocation: data.registryLocation,
          cscExpiryDate: data.cscExpiryDate,
          registrationDate: data.registrationDate,
          status: data.status,
          qrCode: buildContainerQrContent(containerNumber),
          createdBy: actor
        }
      })

      await tx.containerEvent.create({
        data: {
          containerId: container.containerId,
          eventType: 'Registration',
          eventDescription: `Container ${containerNumber} registered in CRTS`,
          eventDate: container.registrationDate,
          createdBy: actor
        }
      })

      await logAudit({
        action: 'container.create',
        actor,
        entityType: 'container',
        entityId: container.containerId,
        details: { containerNumber }
      })

      return container
    })
  }

  async updateContainer(containerId: number, data: UpdateContainerInput, actor: string) {
    const existing = await containerRepository.findByContainerId(containerId)
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedBy: actor
    }

    if (data.containerNumber) {
      const resolvedNumber = resolveContainerNumberInput(data.containerNumber)
      const validation = validateContainerNumber(resolvedNumber)
      if (!validation.valid) {
        throw createError({
          statusCode: 422,
          statusMessage: validation.error || 'Invalid container number'
        })
      }

      const containerNumber = validation.normalized
      if (containerNumber !== existing.containerNumber) {
        const duplicate = await containerRepository.findByContainerNumber(containerNumber)
        if (duplicate) {
          throw createError({
            statusCode: 409,
            statusMessage: 'Container number already exists'
          })
        }
        updateData.containerNumber = containerNumber
        updateData.qrCode = buildContainerQrContent(containerNumber)
      }
    }

    const updated = await containerRepository.updateByContainerId(containerId, updateData)

    await logAudit({
      action: 'container.update',
      actor,
      entityType: 'container',
      entityId: containerId,
      details: { containerNumber: updated.containerNumber }
    })

    return updated
  }

  async updateStatus(containerId: number, status: 'Active' | 'Inactive', actor: string) {
    const existing = await containerRepository.findByContainerId(containerId)
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    if (existing.status === status) {
      return existing
    }

    return prisma.$transaction(async (tx) => {
      const container = await tx.container.update({
        where: { containerId },
        data: {
          status,
          updatedBy: actor
        }
      })

      await tx.containerEvent.create({
        data: {
          containerId,
          eventType: 'StatusChange',
          eventDescription: `Status changed from ${existing.status} to ${status}`,
          eventDate: new Date(),
          createdBy: actor
        }
      })

      await logAudit({
        action: 'container.status_change',
        actor,
        entityType: 'container',
        entityId: containerId,
        details: {
          containerNumber: existing.containerNumber,
          from: existing.status,
          to: status
        }
      })

      return container
    })
  }

  async deactivateContainer(containerId: number, actor: string) {
    return this.updateStatus(containerId, 'Inactive', actor)
  }

  async deleteContainer(containerId: number, actor: string) {
    const existing = await containerRepository.findByContainerId(containerId)
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    await containerRepository.deleteByContainerId(containerId)

    await logAudit({
      action: 'container.delete',
      actor,
      entityType: 'container',
      entityId: containerId,
      details: { containerNumber: existing.containerNumber }
    })
  }
}

export const containerService = new ContainerService()
export { getActorName }
