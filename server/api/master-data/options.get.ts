import { masterDataService } from '../../services/master-data.service'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)
  const query = validateQuery(event, MasterDataOptionsQuerySchema)
  const options = await masterDataService.getOptions(query.category)
  return sendSuccess(options)
})
