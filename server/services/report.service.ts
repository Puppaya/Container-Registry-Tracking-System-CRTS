import {
  containerEventRepository,
  containerRepository
} from '../utils/repositories'
import { formatDisplayDate } from '../utils/date-format'
import type { ReportQuery, ReportTable } from '../types/report'

export class ReportService {
  async getRegistryReport(query: ReportQuery): Promise<ReportTable> {
    const rows = await containerRepository.findForRegistryReport({
      status: query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo
    })

    return {
      title: 'Container Registry Report',
      headers: ['Container No.', 'ISO', 'Size', 'Category', 'Owner', 'Status', 'Registered'],
      rows: rows.map((row: {
        containerNumber: string
        isoType: string
        containerSize: string
        containerCategory: string
        owner: string
        status: string
        registrationDate: Date
      }) => [
        row.containerNumber,
        row.isoType,
        row.containerSize,
        row.containerCategory,
        row.owner,
        row.status,
        formatDisplayDate(row.registrationDate)
      ]),
      generatedAt: new Date().toISOString()
    }
  }

  async getLifecycleReport(query: ReportQuery): Promise<ReportTable> {
    const events = await containerEventRepository.findForLifecycleReport({
      dateFrom: query.dateFrom,
      dateTo: query.dateTo
    })

    return {
      title: 'Container Lifecycle Report',
      headers: ['Container No.', 'Event Type', 'Description', 'Event Date', 'Created By'],
      rows: events.map((event: {
        eventType: string
        eventDescription?: string | null
        eventDate: Date
        createdBy: string
        container: { containerNumber: string }
      }) => [
        event.container.containerNumber,
        event.eventType,
        event.eventDescription || '',
        formatDisplayDate(event.eventDate),
        event.createdBy
      ]),
      generatedAt: new Date().toISOString()
    }
  }

  async getSurveyCoverageReport(): Promise<ReportTable> {
    const containers = await containerRepository.findForSurveyCoverageReport()

    return {
      title: 'Survey Coverage Report',
      headers: ['Container No.', 'Owner', 'Status', 'Surveyed', 'Latest Result', 'Survey Date', 'Reference No.'],
      rows: containers.map((row: {
        containerNumber: string
        owner: string
        status: string
        surveys: Array<{
          surveyDate: Date
          result: string
          surveyReferenceNo: string
        }>
      }) => {
        const latest = row.surveys[0]
        return [
          row.containerNumber,
          row.owner,
          row.status,
          latest ? 'Yes' : 'No',
          latest?.result || '',
          latest ? formatDisplayDate(latest.surveyDate) : '',
          latest?.surveyReferenceNo || ''
        ]
      }),
      generatedAt: new Date().toISOString()
    }
  }

  async getStatusSummaryReport(): Promise<ReportTable> {
    const [statusGroups, sizeGroups, categoryGroups] = await Promise.all([
      containerRepository.groupByField('status'),
      containerRepository.groupByField('containerSize'),
      containerRepository.groupByField('containerCategory')
    ])

    const rows: Array<Array<string | number | null>> = [
      ['Status Summary', '', ''],
      ...statusGroups.map((item: { status: string, _count: { containerId: number } }) => ['Status', item.status, item._count.containerId]),
      ['', '', ''],
      ['Size Summary', '', ''],
      ...sizeGroups.map((item: { containerSize: string, _count: { containerId: number } }) => ['Size', item.containerSize, item._count.containerId]),
      ['', '', ''],
      ['Category Summary', '', ''],
      ...categoryGroups.map((item: { containerCategory: string, _count: { containerId: number } }) => ['Category', item.containerCategory, item._count.containerId])
    ]

    return {
      title: 'Status Summary Report',
      headers: ['Group', 'Label', 'Count'],
      rows,
      generatedAt: new Date().toISOString()
    }
  }
}

export const reportService = new ReportService()
