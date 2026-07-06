import { reportService } from '../../services/report.service'
import { ReportQuerySchema } from '../../utils/validation'
import { sendReportResponse } from '../../utils/report-export'

export default defineEventHandler(async (event) => {
  await requireReportAccess(event)

  const query = getQuery(event)
  const params = ReportQuerySchema.parse({
    format: query.format,
    status: query.status,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo
  })

  const table = await reportService.getRegistryReport(params)
  return sendReportResponse(event, table, params.format)
})
