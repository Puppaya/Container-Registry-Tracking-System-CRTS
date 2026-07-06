import {
  containerRepository,
  containerEventRepository
} from '../utils/repositories'
import { resolveContainerNumberInput } from '../utils/container-validation'
import { logAudit } from '../utils/audit-log'
import type {
  ExternalGateRecord,
  GateSyncResultItem,
  GateSyncSummary
} from '../types/gate'

const INTEGRATION_ACTOR = 'smart-gate-integration'

function buildSummary(items: GateSyncResultItem[]): GateSyncSummary {
  return {
    total: items.length,
    created: items.filter(i => i.status === 'created').length,
    skipped: items.filter(i => i.status === 'skipped').length,
    failed: items.filter(i => i.status === 'failed').length,
    items
  }
}

function buildEventDescription(record: ExternalGateRecord): string {
  const parts = [
    record.location,
    `Plate: ${record.vehiclePlateNo}`
  ]

  if (record.gateName) parts.push(`Gate: ${record.gateName}`)
  if (record.laneNo) parts.push(`Lane: ${record.laneNo}`)
  if (record.facilityName) parts.push(record.facilityName)
  if (record.driverName) parts.push(`Driver: ${record.driverName}`)
  if (record.transportCompany) parts.push(record.transportCompany)
  if (record.sealNo) parts.push(`Seal: ${record.sealNo}`)
  if (record.bookingNo) parts.push(`Booking: ${record.bookingNo}`)
  if (record.remarks) parts.push(record.remarks)

  return parts.join(' | ')
}

export class GateSyncService {
  async syncRecord(record: ExternalGateRecord, actor = INTEGRATION_ACTOR): Promise<GateSyncResultItem> {
    const containerNumber = resolveContainerNumberInput(record.containerNumber)

    try {
      const container = await containerRepository.findByContainerNumber(containerNumber)
      if (!container) {
        return {
          gateReferenceNo: record.gateReferenceNo,
          containerNumber,
          status: 'skipped',
          reason: 'container_not_found'
        }
      }

      const existing = await containerEventRepository.findByExternalReferenceNo(record.gateReferenceNo)
      if (existing) {
        return {
          gateReferenceNo: record.gateReferenceNo,
          containerNumber,
          status: 'skipped',
          reason: 'already_synced'
        }
      }

      await containerEventRepository.create({
        containerId: container.containerId,
        eventType: record.eventType,
        eventDescription: buildEventDescription(record),
        eventDate: new Date(record.eventDate),
        externalReferenceNo: record.gateReferenceNo,
        createdBy: actor
      })

      return {
        gateReferenceNo: record.gateReferenceNo,
        containerNumber,
        status: 'created'
      }
    } catch (error) {
      return {
        gateReferenceNo: record.gateReferenceNo,
        containerNumber,
        status: 'failed',
        reason: error instanceof Error ? error.message : 'unknown_error'
      }
    }
  }

  async syncInbound(records: ExternalGateRecord[], actor = INTEGRATION_ACTOR): Promise<GateSyncSummary> {
    const items: GateSyncResultItem[] = []

    for (const record of records) {
      items.push(await this.syncRecord(record, actor))
    }

    const summary = buildSummary(items)

    await logAudit({
      action: 'gate.sync',
      actor,
      entityType: 'container_event',
      details: {
        source: 'inbound',
        total: summary.total,
        created: summary.created,
        skipped: summary.skipped,
        failed: summary.failed
      }
    })

    return summary
  }
}

export const gateSyncService = new GateSyncService()
