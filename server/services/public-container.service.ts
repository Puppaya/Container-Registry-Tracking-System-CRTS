import prisma from '../utils/prisma'
import {
  containerRepository,
  containerEventRepository,
  containerSurveyRepository
} from '../utils/repositories'
import {
  resolveContainerNumberInput,
  validateContainerNumber
} from '../utils/container-validation'
import { buildContainerQrContent, parseQrScanInput } from '../utils/qr-code'
import { resolveCurrentStatus } from '../utils/container-location'
import { logAudit } from '../utils/audit-log'
import { generatePublicRegistrationReference } from '../utils/public-container-reference'
import { mapPublicTrackResponse } from '../utils/public-container-mapper'
import type { PublicContainerRegisterInput } from '../utils/validation'

const PUBLIC_ACTOR = 'public-portal'

function assertCheckDigit(containerNumber: string, checkDigit: string) {
  const normalized = resolveContainerNumberInput(containerNumber)
  if (normalized.length !== 11 || normalized.slice(-1) !== checkDigit) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Container not found'
    })
  }
}

function buildSubmitterDescription(input: PublicContainerRegisterInput, reference: string) {
  const phone = input.submitterPhone?.trim()
  return [
    `Public registration request ${reference}`,
    `Submitter: ${input.submitterName.trim()}`,
    `Email: ${input.submitterEmail.trim()}`,
    ...(phone ? [`Phone: ${phone}`] : [])
  ].join('\n')
}

export class PublicContainerService {
  async registerContainer(input: PublicContainerRegisterInput) {
    const resolvedNumber = resolveContainerNumberInput(
      `${input.containerPrefix}${input.checkDigit}`
    )
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

    const reference = generatePublicRegistrationReference()

    return prisma.$transaction(async (tx) => {
      const container = await tx.container.create({
        data: {
          containerNumber,
          isoType: input.isoType,
          containerSize: input.containerSize,
          containerCategory: input.containerCategory,
          owner: input.owner,
          manufacturer: input.manufacturer,
          yearBuilt: input.yearBuilt,
          tareWeight: input.tareWeight,
          maxPayload: input.maxPayload,
          internalVolume: input.internalVolume,
          leaseProvider: input.leaseProvider,
          registryLocation: input.registryLocation,
          cscExpiryDate: input.cscExpiryDate,
          registrationDate: input.registrationDate,
          status: 'Pending',
          qrCode: buildContainerQrContent(containerNumber),
          createdBy: PUBLIC_ACTOR
        }
      })

      await tx.containerEvent.create({
        data: {
          containerId: container.containerId,
          eventType: 'Registration',
          eventDescription: buildSubmitterDescription(input, reference),
          eventDate: container.registrationDate,
          externalReferenceNo: reference,
          createdBy: PUBLIC_ACTOR
        }
      })

      await logAudit({
        action: 'container.create',
        actor: PUBLIC_ACTOR,
        entityType: 'container',
        entityId: container.containerId,
        details: {
          containerNumber,
          reference,
          submitterEmail: input.submitterEmail
        }
      })

      return {
        reference,
        containerNumber: container.containerNumber,
        status: container.status
      }
    })
  }

  async trackContainer(containerNumber: string, checkDigit: string) {
    assertCheckDigit(containerNumber, checkDigit)
    const normalized = resolveContainerNumberInput(containerNumber)
    const container = await containerRepository.findByContainerNumber(normalized)

    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    return this.buildTrackResponse(container.containerId)
  }

  async trackByQr(code: string) {
    const { containerNumber } = parseQrScanInput(code)
    const container = await containerRepository.findByQrCode(code)
      ?? await containerRepository.findByContainerNumber(containerNumber)

    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found for this QR code'
      })
    }

    return this.buildTrackResponse(container.containerId)
  }

  async uploadDocument(input: {
    containerNumber: string
    checkDigit: string
    documentType: string
    fileName: string
    mimeType?: string
    data: Buffer
  }) {
    assertCheckDigit(input.containerNumber, input.checkDigit)

    const normalized = resolveContainerNumberInput(input.containerNumber)
    const container = await containerRepository.findByContainerNumber(normalized)

    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    if (container.status !== 'Pending') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Documents can only be uploaded for pending registration requests'
      })
    }

    const { containerDocumentService } = await import('./container-document.service')

    return containerDocumentService.uploadDocument({
      containerId: container.containerId,
      documentType: input.documentType,
      fileName: input.fileName,
      mimeType: input.mimeType,
      data: input.data,
      actor: PUBLIC_ACTOR
    })
  }

  private async buildTrackResponse(containerId: number) {
    const container = await containerRepository.findByContainerId(containerId)
    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    const [
      latestSurvey,
      recentMovements,
      latestMovement,
      timelineEvents,
      registrationEvent
    ] = await Promise.all([
      containerSurveyRepository.findLatestByContainerId(containerId),
      containerEventRepository.findRecentMovements(containerId),
      containerEventRepository.findLatestMovementByContainerId(containerId),
      containerEventRepository.findByContainerId(containerId),
      containerEventRepository.findByContainerId(containerId).then((events: Array<{ eventType: string, externalReferenceNo?: string | null }>) =>
        events.find(event => event.eventType === 'Registration')
      )
    ])

    const operationalStatus = container.status === 'Inactive' ? 'Inactive' : 'Active'

    return mapPublicTrackResponse({
      container,
      currentStatus: resolveCurrentStatus(
        operationalStatus,
        latestMovement,
        container.registryLocation
      ),
      latestSurvey: latestSurvey
        ? {
            surveyDate: latestSurvey.surveyDate,
            result: latestSurvey.result
          }
        : null,
      recentMovements,
      timeline: timelineEvents,
      registrationReference: registrationEvent?.externalReferenceNo ?? null
    })
  }
}

export const publicContainerService = new PublicContainerService()
