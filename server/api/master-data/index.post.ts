import { masterDataService } from '../../services/master-data.service'
import { getActorName } from '../../services/container.service'
import { masterDataRepository } from '../../utils/repositories'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { user } = await getUserSession(event)
  const data = await validateRequest(event, MasterDataSchema)

  const existing = await masterDataRepository.findByCategoryAndCode(data.category, data.code)
  if (existing) {
    return sendApiError('Code already exists for this category', 409)
  }

  const record = await masterDataService.createMasterData(data, getActorName(user!))
  return sendSuccess(record, 'Master data created successfully')
})
