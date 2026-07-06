import { reportService } from '../../services/report.service'
import { ReportQuerySchema } from '../../utils/validation'
import { sendReportResponse } from '../../utils/report-export'

export default defineEventHandler(async (event) => {
  await requireReportAccess(event)

  const query = getQuery(event)
  const params = ReportQuerySchema.parse({ format: query.format })

  const table = await reportService.getSurveyCoverageReport()
  return sendReportResponse(event, table, params.format)
})
