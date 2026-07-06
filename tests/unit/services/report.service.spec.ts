import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reportService } from '../../../server/services/report.service'
import {
  containerEventRepository,
  containerRepository
} from '../../../server/utils/repositories'

vi.mock('../../../server/utils/repositories', () => ({
  containerRepository: {
    findForRegistryReport: vi.fn(),
    findForSurveyCoverageReport: vi.fn(),
    groupByField: vi.fn()
  },
  containerEventRepository: {
    findForLifecycleReport: vi.fn()
  }
}))

describe('ReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build registry report table', async () => {
    vi.mocked(containerRepository.findForRegistryReport).mockResolvedValue([
      {
        containerNumber: 'MSCU1234566',
        isoType: '22G1',
        containerSize: '20',
        containerCategory: 'Dry',
        owner: 'MSC',
        status: 'Active',
        registrationDate: new Date('2026-01-01')
      }
    ] as any)

    const table = await reportService.getRegistryReport({ format: 'json' })

    expect(table.title).toBe('Container Registry Report')
    expect(table.rows).toHaveLength(1)
    expect(table.rows[0][0]).toBe('MSCU1234566')
  })

  it('should build lifecycle report table', async () => {
    vi.mocked(containerEventRepository.findForLifecycleReport).mockResolvedValue([
      {
        eventType: 'GateIn',
        eventDescription: 'Arrived',
        eventDate: new Date('2026-01-02'),
        createdBy: 'admin',
        container: { containerNumber: 'MSCU1234566' }
      }
    ] as any)

    const table = await reportService.getLifecycleReport({ format: 'json' })

    expect(table.rows[0][0]).toBe('MSCU1234566')
    expect(table.rows[0][1]).toBe('GateIn')
  })

  it('should build status summary report table', async () => {
    vi.mocked(containerRepository.groupByField).mockResolvedValue([
      { status: 'Active', _count: { containerId: 5 } }
    ] as any)

    const table = await reportService.getStatusSummaryReport()

    expect(table.headers).toEqual(['Group', 'Label', 'Count'])
    expect(table.rows.some(row => row[1] === 'Active')).toBe(true)
  })
})
