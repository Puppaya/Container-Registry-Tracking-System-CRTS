import { masterDataService } from '../../services/master-data.service'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = validateQuery(event, MasterDataListQuerySchema)
  const result = await masterDataService.getMasterDataList(query)
  return sendSuccess(result)
})
