import { dashboardService } from '../../services/dashboard.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const query = getQuery(event)
  const limit = Number(query.limit) || 15

  const activities = await dashboardService.getRecentActivities(
    Number.isNaN(limit) ? 15 : Math.min(Math.max(limit, 1), 50)
  )

  return sendSuccess(activities)
})
