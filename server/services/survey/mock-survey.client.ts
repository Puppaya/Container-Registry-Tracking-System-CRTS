import type { ExternalSurveyRecord } from '../../types/survey'

export function getMockSurveyRecords(): ExternalSurveyRecord[] {
  const now = new Date()

  return [
    {
      surveyReferenceNo: 'SRV-2026-0001',
      containerNumber: 'MSCU1234566',
      surveyDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14),
      inspector: 'Somchai V.',
      result: 'Pass',
      damageSummary: 'Minor door seal wear',
      reportUrl: 'https://example.com/reports/SRV-2026-0001.pdf'
    },
    {
      surveyReferenceNo: 'SRV-2026-0002',
      containerNumber: 'HLCU6543210',
      surveyDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
      inspector: 'Bounmy K.',
      result: 'Conditional Pass',
      damageSummary: 'Floor panel scratch',
      reportUrl: 'https://example.com/reports/SRV-2026-0002.pdf'
    },
    {
      surveyReferenceNo: 'SRV-2026-0003',
      containerNumber: 'MSCU1234566',
      surveyDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
      inspector: 'Khamla P.',
      result: 'Pass',
      damageSummary: null,
      reportUrl: null
    },
    {
      surveyReferenceNo: 'SRV-2026-0004',
      containerNumber: 'HLCU6543210',
      surveyDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21),
      inspector: 'Noy S.',
      result: 'Fail',
      damageSummary: 'Structural damage on corner post',
      reportUrl: 'https://example.com/reports/SRV-2026-0004.pdf'
    },
    {
      surveyReferenceNo: 'SRV-2026-0005',
      containerNumber: 'MSCU1234566',
      surveyDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      inspector: 'Vieng X.',
      result: 'Pass',
      damageSummary: 'Surface rust on door hinge',
      reportUrl: 'https://example.com/reports/SRV-2026-0005.pdf'
    }
  ]
}

export async function fetchMockSurveys(containerNumber?: string): Promise<ExternalSurveyRecord[]> {
  const records = getMockSurveyRecords()
  if (!containerNumber) return records

  const normalized = containerNumber.toUpperCase().replace(/[\s-]/g, '')
  return records.filter((record) =>
    record.containerNumber.toUpperCase().replace(/[\s-]/g, '').includes(normalized)
    || normalized.includes(record.containerNumber.toUpperCase().replace(/[\s-]/g, ''))
  )
}

export function getMockSurveyReferenceFromId(surveyId: string | number) {
  if (typeof surveyId !== 'string' || !surveyId.startsWith('mock-')) {
    return null
  }
  return surveyId.replace(/^mock-/, '')
}
