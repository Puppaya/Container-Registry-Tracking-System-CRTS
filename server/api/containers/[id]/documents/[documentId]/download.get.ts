import {
  containerDocumentService,
  streamLocalDownload
} from '../../../../../services/container-document.service'
import { sendStream } from 'h3'

export default defineEventHandler(async (event) => {
  await requireRegistryRead(event)

  const containerId = Number(getRouterParam(event, 'id'))
  const documentId = Number(getRouterParam(event, 'documentId'))

  if (Number.isNaN(containerId) || Number.isNaN(documentId)) {
    return sendApiError('Invalid container or document ID', 400)
  }

  const target = await containerDocumentService.getDownloadTarget(containerId, documentId)

  if (target.mode === 'redirect') {
    return sendRedirect(event, target.url, 302)
  }

  setResponseHeader(event, 'Content-Type', target.contentType)
  setResponseHeader(
    event,
    'Content-Disposition',
    `${target.disposition}; filename="${encodeURIComponent(target.fileName)}"`
  )

  return sendStream(event, streamLocalDownload(target.filePath))
})
