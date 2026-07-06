import { masterDataService } from '../../services/master-data.service'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const masterDataId = Number(getRouterParam(event, 'id'))

  if (!masterDataId) {
    return sendApiError('Invalid master data ID', 400)
  }

  const record = await masterDataService.getMasterDataById(masterDataId)
  if (!record) {
    return sendApiError('Master data not found', 404)
  }

  return sendSuccess(record)
})
