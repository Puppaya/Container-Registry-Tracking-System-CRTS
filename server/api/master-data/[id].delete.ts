import { masterDataService } from '../../services/master-data.service'
import { getActorName } from '../../services/container.service'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { user } = await getUserSession(event)
  const masterDataId = Number(getRouterParam(event, 'id'))

  if (!masterDataId) {
    return sendApiError('Invalid master data ID', 400)
  }

  const record = await masterDataService.deleteMasterData(masterDataId, getActorName(user!))
  if (!record) {
    return sendApiError('Master data not found', 404)
  }

  return sendSuccess(record, 'Master data deleted successfully')
})
