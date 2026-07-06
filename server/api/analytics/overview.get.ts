import { analyticsService } from '../../services/analytics.service'

export default defineEventHandler(async (event) => {
  await requireReportAccess(event)

  const overview = await analyticsService.getOverview()
  return sendSuccess(overview, 'Analytics overview loaded')
})
