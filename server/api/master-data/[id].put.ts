import { masterDataService } from '../../services/master-data.service'
import { getActorName } from '../../services/container.service'
import { masterDataRepository } from '../../utils/repositories'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { user } = await getUserSession(event)
  const masterDataId = Number(getRouterParam(event, 'id'))

  if (!masterDataId) {
    return sendApiError('Invalid master data ID', 400)
  }

  const existing = await masterDataRepository.findByMasterDataId(masterDataId)
  if (!existing) {
    return sendApiError('Master data not found', 404)
  }

  const data = await validateRequest(event, MasterDataUpdateSchema)

  if (data.code && data.code !== existing.code) {
    const duplicate = await masterDataRepository.findByCategoryAndCode(existing.category, data.code)
    if (duplicate && duplicate.masterDataId !== masterDataId) {
      return sendApiError('Code already exists for this category', 409)
    }
  }

  const record = await masterDataService.updateMasterData(masterDataId, data, getActorName(user!))
  return sendSuccess(record, 'Master data updated successfully')
})
