import { describe, it, expect } from 'vitest'
import { buildExcelBuffer, buildPdfBuffer } from '../../../server/utils/report-export'
import type { ReportTable } from '../../../server/types/report'

const sampleTable: ReportTable = {
  title: 'Test Report',
  headers: ['Col A', 'Col B'],
  rows: [['A1', 'B1'], ['A2', 'B2']],
  generatedAt: '2026-01-01T00:00:00.000Z'
}

const registryTable: ReportTable = {
  title: 'Container Registry Report',
  headers: ['Container No.', 'ISO', 'Size', 'Category', 'Owner', 'Status', 'Registered'],
  rows: [
    ['EGSU3189508', '22G1', '20', 'Dry', 'Hapag-Lloyd', 'Active', '03/07/2026'],
    ['TBJU7902764', 'L5G1', '45', 'Dry', 'Hapag-Lloyd', 'Active', '03/07/2026']
  ],
  generatedAt: '2026-08-17T09:50:05.752Z'
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

  it('should build registry pdf with table layout', async () => {
    const buffer = await buildPdfBuffer(registryTable)
    expect(buffer.length).toBeGreaterThan(1000)
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('should build pdf for empty report', async () => {
    const buffer = await buildPdfBuffer({
      ...sampleTable,
      rows: []
    })

    expect(buffer.subarray(0, 4).toString()).toBe('%PDF')
  })
})
