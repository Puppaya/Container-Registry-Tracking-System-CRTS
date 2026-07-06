import {
  containerRepository,
  containerSurveyRepository
} from '../utils/repositories'
import {
  getMockSurveyRecords,
  getMockSurveyReferenceFromId
} from './survey/mock-survey.client'
import type { ExternalSurveyRecord } from '../types/survey'
import type { SurveyInspectionListQuery } from '../utils/validation'

export interface SurveyInspectionRecord {
  surveyId: number | string
  containerId: number | null
  containerNumber: string
  containerOwner?: string | null
  containerStatus?: string | null
  surveyReferenceNo: string
  surveyDate: string
  inspector: string | null
  result: string
  damageSummary: string | null
  reportUrl: string | null
  createdDate: string
  isMock: boolean
}

export interface SurveyInspectionSummary {
  totalInspections: number
  passCount: number
  conditionalCount: number
  failCount: number
  recentInspections: number
}

export interface SurveyInspectionListResponse {
  data: SurveyInspectionRecord[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    dataSource: 'database' | 'mock'
  }
}

function normalizeResultBucket(result: string) {
  const value = result.toLowerCase()
  if (value.includes('conditional')) return 'conditional'
  if (value.includes('fail')) return 'fail'
  if (value.includes('pass')) return 'pass'
  return 'other'
}

function mapDbRecord(record: {
  surveyId: number
  containerId: number
  surveyReferenceNo: string
  surveyDate: Date
  inspector?: string | null
  result: string
  damageSummary?: string | null
  reportUrl?: string | null
  createdDate: Date
  container?: {
    containerNumber?: string
    owner?: string
    status?: string
  } | null
}): SurveyInspectionRecord {
  return {
    surveyId: record.surveyId,
    containerId: record.containerId,
    containerNumber: record.container?.containerNumber ?? '',
    containerOwner: record.container?.owner ?? null,
    containerStatus: record.container?.status ?? null,
    surveyReferenceNo: record.surveyReferenceNo,
    surveyDate: record.surveyDate.toISOString(),
    inspector: record.inspector ?? null,
    result: record.result,
    damageSummary: record.damageSummary ?? null,
    reportUrl: record.reportUrl ?? null,
    createdDate: record.createdDate.toISOString(),
    isMock: false
  }
}

function mapMockRecord(record: ExternalSurveyRecord): SurveyInspectionRecord {
  const surveyDate = new Date(record.surveyDate)

  return {
    surveyId: `mock-${record.surveyReferenceNo}`,
    containerId: null,
    containerNumber: record.containerNumber,
    containerOwner: null,
    containerStatus: null,
    surveyReferenceNo: record.surveyReferenceNo,
    surveyDate: surveyDate.toISOString(),
    inspector: record.inspector ?? null,
    result: record.result,
    damageSummary: record.damageSummary ?? null,
    reportUrl: record.reportUrl ?? null,
    createdDate: surveyDate.toISOString(),
    isMock: true
  }
}

function buildInspectionWhere(params: Pick<SurveyInspectionListQuery, 'search' | 'result' | 'containerId' | 'dateFrom' | 'dateTo'>) {
  const where: Record<string, unknown> = {}

  if (params.containerId) {
    where.containerId = params.containerId
  }

  if (params.result && params.result !== 'all') {
    if (params.result === 'pass') {
      where.result = { contains: 'Pass' }
    } else if (params.result === 'conditional') {
      where.result = { contains: 'Conditional' }
    } else if (params.result === 'fail') {
      where.result = { contains: 'Fail' }
    } else {
      where.result = params.result
    }
  }

  if (params.dateFrom || params.dateTo) {
    where.surveyDate = {
      ...(params.dateFrom ? { gte: params.dateFrom } : {}),
      ...(params.dateTo ? { lte: params.dateTo } : {})
    }
  }

  if (params.search) {
    where.OR = [
      { surveyReferenceNo: { contains: params.search.toUpperCase() } },
      { inspector: { contains: params.search } },
      { damageSummary: { contains: params.search } },
      { container: { containerNumber: { contains: params.search.toUpperCase() } } }
    ]
  }

  return where
}

function filterMockRecords(records: ExternalSurveyRecord[], params: SurveyInspectionListQuery, containerNumber?: string) {
  let filtered = records.map(mapMockRecord)

  if (containerNumber) {
    const normalized = containerNumber.toUpperCase().replace(/[\s-]/g, '')
    filtered = filtered.filter((record) =>
      record.containerNumber.toUpperCase().replace(/[\s-]/g, '').includes(normalized)
    )
  }

  if (params.containerId) {
    // mock records have no containerId — keep all mock when filtering by containerId if container number unavailable
  }

  if (params.result && params.result !== 'all') {
    filtered = filtered.filter((record) => normalizeResultBucket(record.result) === params.result)
  }

  if (params.search) {
    const term = params.search.toLowerCase()
    filtered = filtered.filter((record) =>
      record.surveyReferenceNo.toLowerCase().includes(term)
      || record.containerNumber.toLowerCase().includes(term)
      || (record.inspector || '').toLowerCase().includes(term)
      || (record.damageSummary || '').toLowerCase().includes(term)
    )
  }

  if (params.dateFrom || params.dateTo) {
    filtered = filtered.filter((record) => {
      const date = new Date(record.surveyDate)
      if (params.dateFrom && date < params.dateFrom) return false
      if (params.dateTo && date > params.dateTo) return false
      return true
    })
  }

  filtered.sort((a, b) => new Date(b.surveyDate).getTime() - new Date(a.surveyDate).getTime())
  return filtered
}

function paginateMockRecords(records: SurveyInspectionRecord[], page: number, pageSize: number) {
  const total = records.length
  const start = (page - 1) * pageSize
  const data = records.slice(start, start + pageSize)

  return {
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
      dataSource: 'mock' as const
    }
  }
}

function buildSummaryFromRecords(records: SurveyInspectionRecord[]): SurveyInspectionSummary {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  return {
    totalInspections: records.length,
    passCount: records.filter(r => normalizeResultBucket(r.result) === 'pass').length,
    conditionalCount: records.filter(r => normalizeResultBucket(r.result) === 'conditional').length,
    failCount: records.filter(r => normalizeResultBucket(r.result) === 'fail').length,
    recentInspections: records.filter(r => new Date(r.surveyDate) >= since).length
  }
}

export class SurveyInspectionService {
  async getInspectionRecords(params: SurveyInspectionListQuery): Promise<SurveyInspectionListResponse> {
    const { page, pageSize, ...filters } = params
    const where = buildInspectionWhere(filters)

    const dbResult = await containerSurveyRepository.findPaginatedInspections({
      page,
      pageSize,
      where
    })

    if (dbResult.meta.total > 0) {
      return {
        data: dbResult.data.map((record: Parameters<typeof mapDbRecord>[0]) => mapDbRecord(record)),
        meta: {
          ...dbResult.meta,
          dataSource: 'database'
        }
      }
    }

    let containerNumber: string | undefined
    if (params.containerId) {
      const container = await containerRepository.findByContainerId(params.containerId)
      containerNumber = container?.containerNumber
    }

    const mockRecords = filterMockRecords(getMockSurveyRecords(), params, containerNumber)
    return paginateMockRecords(mockRecords, page, pageSize)
  }

  async getInspectionRecord(surveyId: string | number): Promise<SurveyInspectionRecord> {
    if (typeof surveyId === 'string' && surveyId.startsWith('mock-')) {
      const reference = getMockSurveyReferenceFromId(surveyId)
      const mock = getMockSurveyRecords().find(record => record.surveyReferenceNo === reference)
      if (!mock) {
        throw createError({ statusCode: 404, statusMessage: 'Survey inspection record not found' })
      }
      return mapMockRecord(mock)
    }

    const numericId = Number(surveyId)
    if (Number.isNaN(numericId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid survey ID' })
    }

    const record = await containerSurveyRepository.findInspectionBySurveyId(numericId)
    if (!record) {
      throw createError({ statusCode: 404, statusMessage: 'Survey inspection record not found' })
    }

    return mapDbRecord(record)
  }

  async getInspectionSummary(containerId?: number): Promise<SurveyInspectionSummary & { dataSource: 'database' | 'mock' }> {
    const where = containerId ? { containerId } : undefined
    const total = await containerSurveyRepository.count(where)

    if (total > 0) {
      const since = new Date()
      since.setDate(since.getDate() - 30)

      const [groups, recentInspections] = await Promise.all([
        containerSurveyRepository.groupByResult(where),
        containerSurveyRepository.count({
          ...where,
          surveyDate: { gte: since }
        })
      ])

      const passCount = groups
        .filter((item: { result: string }) => normalizeResultBucket(item.result) === 'pass')
        .reduce((sum: number, item: { _count: { surveyId: number } }) => sum + item._count.surveyId, 0)
      const conditionalCount = groups
        .filter((item: { result: string }) => normalizeResultBucket(item.result) === 'conditional')
        .reduce((sum: number, item: { _count: { surveyId: number } }) => sum + item._count.surveyId, 0)
      const failCount = groups
        .filter((item: { result: string }) => normalizeResultBucket(item.result) === 'fail')
        .reduce((sum: number, item: { _count: { surveyId: number } }) => sum + item._count.surveyId, 0)

      return {
        totalInspections: total,
        passCount,
        conditionalCount,
        failCount,
        recentInspections,
        dataSource: 'database'
      }
    }

    let containerNumber: string | undefined
    if (containerId) {
      const container = await containerRepository.findByContainerId(containerId)
      containerNumber = container?.containerNumber
    }

    const mockRecords = filterMockRecords(
      getMockSurveyRecords(),
      { page: 1, pageSize: 100, containerId },
      containerNumber
    )

    return {
      ...buildSummaryFromRecords(mockRecords),
      dataSource: 'mock'
    }
  }

  async getByContainer(containerId: number) {
    const container = await containerRepository.findByContainerId(containerId)
    if (!container) {
      throw createError({ statusCode: 404, statusMessage: 'Container not found' })
    }

    const result = await this.getInspectionRecords({
      page: 1,
      pageSize: 100,
      containerId
    })

    return {
      container,
      surveys: result.data,
      dataSource: result.meta.dataSource
    }
  }
}

export const surveyInspectionService = new SurveyInspectionService()
