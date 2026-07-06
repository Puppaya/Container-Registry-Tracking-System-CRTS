import { containerService } from '../../services/container.service'
import { ContainerListQuerySchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const query = getQuery(event)
  const params = ContainerListQuerySchema.parse({
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    status: query.status,
    owner: query.owner,
    isoType: query.isoType,
    containerCategory: query.containerCategory,
    containerSize: query.containerSize,
    surveyStatus: query.surveyStatus,
    registrationDateFrom: query.registrationDateFrom,
    registrationDateTo: query.registrationDateTo
  })

  const result = await containerService.getContainers(params)
  return sendSuccess(result)
})
