import { containerDocumentService } from '../../../../services/container-document.service'
import { getActorName } from '../../../../services/container.service'

export default defineEventHandler(async (event) => {
  await requireRegistryOfficer(event)

  const { user } = await getUserSession(event)
  const actor = getActorName(user!)

  const containerId = Number(getRouterParam(event, 'id'))
  const documentId = Number(getRouterParam(event, 'documentId'))

  if (Number.isNaN(containerId) || Number.isNaN(documentId)) {
    return sendApiError('Invalid container or document ID', 400)
  }

  await containerDocumentService.deleteDocument(containerId, documentId, actor)
  return sendSuccess(null, 'Document deleted successfully')
})
