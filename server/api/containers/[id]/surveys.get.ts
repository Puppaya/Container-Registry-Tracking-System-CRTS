import { surveyInspectionService } from '../../../services/survey-inspection.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const containerId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(containerId)) {
    return sendApiError('Invalid container ID', 400)
  }

  const result = await surveyInspectionService.getByContainer(containerId)
  return sendSuccess(result)
})
