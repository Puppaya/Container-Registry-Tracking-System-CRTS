import { containerDocumentService } from '../../../../services/container-document.service'
import { getActorName } from '../../../../services/container.service'
import { ContainerDocumentUploadSchema } from '../../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requireRegistryOfficer(event)

  const containerId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(containerId)) {
    return sendApiError('Invalid container ID', 400)
  }

  const { user } = await getUserSession(event)
  const form = await readMultipartFormData(event)

  if (!form?.length) {
    return sendApiError('Multipart form data is required', 400)
  }

  const filePart = form.find(part => part.name === 'file')
  const typePart = form.find(part => part.name === 'documentType')

  if (!filePart?.data?.length || !filePart.filename) {
    return sendApiError('File is required', 400)
  }

  const parsed = ContainerDocumentUploadSchema.safeParse({
    documentType: typePart?.data?.toString('utf-8')
  })

  if (!parsed.success) {
    return sendApiError('Validation Failed', 422, parsed.error.flatten())
  }

  const document = await containerDocumentService.uploadDocument({
    containerId,
    documentType: parsed.data.documentType,
    fileName: filePart.filename,
    mimeType: filePart.type || undefined,
    data: Buffer.from(filePart.data),
    actor: getActorName(user!)
  })

  return sendSuccess(document, 'Document uploaded successfully')
})
