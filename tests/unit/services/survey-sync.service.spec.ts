import { describe, it, expect, vi, beforeEach } from 'vitest'
import { surveySyncService } from '../../../server/services/survey-sync.service'
import { containerRepository, containerSurveyRepository } from '../../../server/utils/repositories'

vi.mock('../../../server/services/survey/external-survey.client', () => ({
  fetchExternalSurveys: vi.fn()
}))

vi.mock('../../../server/utils/repositories', () => ({
  containerRepository: {
    findByContainerId: vi.fn(),
    findByContainerNumber: vi.fn()
  },
  containerSurveyRepository: {
    findByContainerId: vi.fn(),
    findByReferenceNo: vi.fn()
  }
}))

vi.mock('../../../server/utils/prisma', () => ({
  default: {
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      containerSurvey: { create: vi.fn().mockResolvedValue({ surveyId: 1 }) },
      containerEvent: { create: vi.fn().mockResolvedValue({}) }
    }))
  }
}))

vi.mock('../../../server/utils/audit-log', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined)
}))

import { fetchExternalSurveys } from '../../../server/services/survey/external-survey.client'

describe('SurveySyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('syncRecord', () => {
    it('should create survey when container exists and reference is new', async () => {
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue({
        containerId: 1,
        containerNumber: 'MSCU1234566'
      } as any)
      vi.mocked(containerSurveyRepository.findByReferenceNo).mockResolvedValue(null)

      const result = await surveySyncService.syncRecord({
        surveyReferenceNo: 'SRV-2026-0001',
        containerNumber: 'MSCU1234566',
        surveyDate: new Date('2026-01-10'),
        inspector: 'Test',
        result: 'Pass'
      }, 'admin')

      expect(result.status).toBe('created')
    })

    it('should skip when survey reference already exists', async () => {
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue({ containerId: 1 } as any)
      vi.mocked(containerSurveyRepository.findByReferenceNo).mockResolvedValue({ surveyId: 1 } as any)

      const result = await surveySyncService.syncRecord({
        surveyReferenceNo: 'SRV-2026-0001',
        containerNumber: 'MSCU1234566',
        surveyDate: new Date(),
        result: 'Pass'
      }, 'admin')

      expect(result.status).toBe('skipped')
      expect(result.reason).toBe('already_synced')
    })
  })

  describe('syncAll', () => {
    it('should process all fetched records', async () => {
      vi.mocked(fetchExternalSurveys).mockResolvedValue({
        records: [
          {
            surveyReferenceNo: 'SRV-2026-0001',
            containerNumber: 'MSCU1234566',
            surveyDate: new Date(),
            result: 'Pass'
          }
        ],
        source: 'external'
      })
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue({ containerId: 1 } as any)
      vi.mocked(containerSurveyRepository.findByReferenceNo).mockResolvedValue(null)

      const summary = await surveySyncService.syncAll('admin')

      expect(summary.total).toBe(1)
      expect(summary.created).toBe(1)
    })
  })

  describe('syncInbound', () => {
    it('should process inbound records and return summary', async () => {
      vi.mocked(containerRepository.findByContainerNumber).mockResolvedValue({ containerId: 1 } as any)
      vi.mocked(containerSurveyRepository.findByReferenceNo).mockResolvedValue(null)

      const summary = await surveySyncService.syncInbound([
        {
          surveyReferenceNo: 'SRV-2026-0100',
          containerNumber: 'MSCU1234566',
          surveyDate: new Date(),
          result: 'Pass'
        }
      ], 'survey-integration')

      expect(summary.total).toBe(1)
      expect(summary.created).toBe(1)
    })
  })
})
