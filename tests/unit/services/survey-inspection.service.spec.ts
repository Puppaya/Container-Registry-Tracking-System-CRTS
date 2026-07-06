import { describe, it, expect, vi, beforeEach } from 'vitest'
import { surveyInspectionService } from '../../../server/services/survey-inspection.service'
import { containerRepository, containerSurveyRepository } from '../../../server/utils/repositories'

vi.mock('../../../server/utils/repositories', () => ({
  containerRepository: {
    findByContainerId: vi.fn()
  },
  containerSurveyRepository: {
    findPaginatedInspections: vi.fn(),
    findInspectionBySurveyId: vi.fn(),
    count: vi.fn(),
    groupByResult: vi.fn()
  }
}))

describe('SurveyInspectionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getInspectionRecords', () => {
    it('should return database records when available', async () => {
      vi.mocked(containerSurveyRepository.findPaginatedInspections).mockResolvedValue({
        data: [{
          surveyId: 1,
          containerId: 10,
          surveyReferenceNo: 'SRV-2026-0100',
          surveyDate: new Date('2026-06-01'),
          inspector: 'Test Inspector',
          result: 'Pass',
          damageSummary: null,
          reportUrl: null,
          createdDate: new Date('2026-06-01'),
          container: {
            containerNumber: 'MSCU1234567',
            owner: 'MSC',
            status: 'Active'
          }
        }],
        meta: { total: 1, page: 1, pageSize: 20, totalPages: 1 }
      } as any)

      const result = await surveyInspectionService.getInspectionRecords({
        page: 1,
        pageSize: 20
      })

      expect(result.meta.dataSource).toBe('database')
      expect(result.data[0].isMock).toBe(false)
    })

    it('should fallback to mock records when database is empty', async () => {
      vi.mocked(containerSurveyRepository.findPaginatedInspections).mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 }
      } as any)

      const result = await surveyInspectionService.getInspectionRecords({
        page: 1,
        pageSize: 20
      })

      expect(result.meta.dataSource).toBe('mock')
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data[0].isMock).toBe(true)
    })
  })

  describe('getInspectionRecord', () => {
    it('should return mock record by mock id', async () => {
      const record = await surveyInspectionService.getInspectionRecord('mock-SRV-2026-0001')

      expect(record.isMock).toBe(true)
      expect(record.surveyReferenceNo).toBe('SRV-2026-0001')
    })
  })

  describe('getInspectionSummary', () => {
    it('should return mock summary when database is empty', async () => {
      vi.mocked(containerSurveyRepository.count).mockResolvedValue(0)

      const summary = await surveyInspectionService.getInspectionSummary()

      expect(summary.dataSource).toBe('mock')
      expect(summary.totalInspections).toBeGreaterThan(0)
    })
  })

  describe('getByContainer', () => {
    it('should return container with mock surveys when none in database', async () => {
      vi.mocked(containerRepository.findByContainerId).mockResolvedValue({
        containerId: 1,
        containerNumber: 'MSCU1234566'
      } as any)
      vi.mocked(containerSurveyRepository.findPaginatedInspections).mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, pageSize: 100, totalPages: 0 }
      } as any)

      const result = await surveyInspectionService.getByContainer(1)

      expect(result.dataSource).toBe('mock')
      expect(result.surveys.length).toBeGreaterThan(0)
    })
  })
})
