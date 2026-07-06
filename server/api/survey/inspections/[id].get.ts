import { surveyInspectionService } from '../../../services/survey-inspection.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    return sendApiError('Invalid survey ID', 400)
  }

  const record = await surveyInspectionService.getInspectionRecord(id)
  return sendSuccess(record)
})
