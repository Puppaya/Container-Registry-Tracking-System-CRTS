import { describe, it, expect } from 'vitest'
import { buildExcelBuffer, buildPdfBuffer } from '../../../server/utils/report-export'
import type { ReportTable } from '../../../server/types/report'

const sampleTable: ReportTable = {
  title: 'Test Report',
  headers: ['Col A', 'Col B'],
  rows: [['A1', 'B1'], ['A2', 'B2']],
  generatedAt: '2026-01-01T00:00:00.000Z'
}

describe('report-export', () => {
  it('should build excel buffer', async () => {
    const buffer = await buildExcelBuffer(sampleTable)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('should build pdf buffer', async () => {
    const buffer = await buildPdfBuffer(sampleTable)
    expect(buffer.length).toBeGreaterThan(0)
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF')
  })
})
