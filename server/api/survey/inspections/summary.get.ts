import { surveyInspectionService } from '../../../services/survey-inspection.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const query = getQuery(event)
  const containerId = query.containerId ? Number(query.containerId) : undefined

  if (query.containerId && Number.isNaN(containerId)) {
    return sendApiError('Invalid container ID', 400)
  }

  const summary = await surveyInspectionService.getInspectionSummary(containerId)
  return sendSuccess(summary)
})
