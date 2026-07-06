import { dashboardService } from '../../services/dashboard.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const summary = await dashboardService.getSummary()
  return sendSuccess(summary)
})
