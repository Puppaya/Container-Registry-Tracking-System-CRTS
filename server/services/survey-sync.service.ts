import prisma from '../utils/prisma'
import {
  containerRepository,
  containerSurveyRepository
} from '../utils/repositories'
import { fetchExternalSurveys } from './survey/external-survey.client'
import type {
  ExternalSurveyRecord,
  SurveySyncResultItem,
  SurveySyncSummary
} from '../types/survey'
import { logAudit } from '../utils/audit-log'

function buildSummary(items: SurveySyncResultItem[]): SurveySyncSummary {
  return {
    total: items.length,
    created: items.filter(i => i.status === 'created').length,
    skipped: items.filter(i => i.status === 'skipped').length,
    failed: items.filter(i => i.status === 'failed').length,
    items
  }
}

export class SurveySyncService {
  async getSurveysByContainer(containerId: number) {
    const container = await containerRepository.findByContainerId(containerId)
    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    const surveys = await containerSurveyRepository.findByContainerId(containerId)
    return { container, surveys }
  }

  async syncRecord(record: ExternalSurveyRecord, actor: string): Promise<SurveySyncResultItem> {
    const containerNumber = record.containerNumber.toUpperCase().replace(/[\s-]/g, '')

    try {
      const container = await containerRepository.findByContainerNumber(containerNumber)
      if (!container) {
        return {
          surveyReferenceNo: record.surveyReferenceNo,
          containerNumber,
          status: 'skipped',
          reason: 'container_not_found'
        }
      }

      const existing = await containerSurveyRepository.findByReferenceNo(record.surveyReferenceNo)
      if (existing) {
        return {
          surveyReferenceNo: record.surveyReferenceNo,
          containerNumber,
          status: 'skipped',
          reason: 'already_synced'
        }
      }

      const surveyDate = new Date(record.surveyDate)

      await prisma.$transaction(async (tx) => {
        await tx.containerSurvey.create({
          data: {
            containerId: container.containerId,
            surveyReferenceNo: record.surveyReferenceNo,
            surveyDate,
            inspector: record.inspector || null,
            result: record.result,
            damageSummary: record.damageSummary || null,
            reportUrl: record.reportUrl || null
          }
        })

        await tx.containerEvent.create({
          data: {
            containerId: container.containerId,
            eventType: 'Survey',
            eventDescription: `Survey ${record.surveyReferenceNo} completed — ${record.result}`,
            eventDate: surveyDate,
            createdBy: actor
          }
        })
      })

      return {
        surveyReferenceNo: record.surveyReferenceNo,
        containerNumber,
        status: 'created'
      }
    } catch (error) {
      return {
        surveyReferenceNo: record.surveyReferenceNo,
        containerNumber,
        status: 'failed',
        reason: error instanceof Error ? error.message : 'unknown_error'
      }
    }
  }

  async syncAll(actor: string, containerNumber?: string): Promise<SurveySyncSummary> {
    const { records, source, containerNumber: normalizedContainerNumber } = await fetchExternalSurveys(containerNumber)
    const items: SurveySyncResultItem[] = []

    for (const record of records) {
      items.push(await this.syncRecord(record, actor))
    }

    const summary = {
      ...buildSummary(items),
      fetchSource: source,
      containerNumber: normalizedContainerNumber || containerNumber?.toUpperCase().replace(/[\s-]/g, '')
    }

    await logAudit({
      action: 'survey.sync',
      actor,
      entityType: 'survey',
      details: {
        containerNumber: containerNumber || 'all',
        total: summary.total,
        created: summary.created,
        skipped: summary.skipped,
        failed: summary.failed,
        items: summary.items
      }
    })

    return summary
  }

  async syncInbound(records: ExternalSurveyRecord[], actor: string): Promise<SurveySyncSummary> {
    const items: SurveySyncResultItem[] = []

    for (const record of records) {
      items.push(await this.syncRecord(record, actor))
    }

    const summary = buildSummary(items)

    await logAudit({
      action: 'survey.sync',
      actor,
      entityType: 'survey',
      details: {
        source: 'inbound',
        total: summary.total,
        created: summary.created,
        skipped: summary.skipped,
        failed: summary.failed,
        items: summary.items
      }
    })

    return summary
  }

  async syncByContainerId(containerId: number, actor: string): Promise<SurveySyncSummary> {
    const container = await containerRepository.findByContainerId(containerId)
    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    return this.syncAll(actor, container.containerNumber)
  }
}

export const surveySyncService = new SurveySyncService()
