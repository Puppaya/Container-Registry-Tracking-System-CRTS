import { surveyInspectionService } from '../../../services/survey-inspection.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const query = validateQuery(event, SurveyInspectionListQuerySchema)
  const result = await surveyInspectionService.getInspectionRecords(query)

  return sendSuccess(result)
})
