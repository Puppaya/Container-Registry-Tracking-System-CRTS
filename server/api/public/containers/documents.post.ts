import { publicContainerService } from '../../../services/public-container.service'
import { PublicContainerDocumentSchema } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)

  if (!form?.length) {
    return sendApiError('Multipart form data is required', 400)
  }

  const filePart = form.find(part => part.name === 'file')
  const containerNumber = form.find(part => part.name === 'containerNumber')?.data?.toString('utf-8')
  const checkDigit = form.find(part => part.name === 'checkDigit')?.data?.toString('utf-8')
  const documentType = form.find(part => part.name === 'documentType')?.data?.toString('utf-8')

  if (!filePart?.data?.length || !filePart.filename) {
    return sendApiError('File is required', 400)
  }

  const parsed = PublicContainerDocumentSchema.safeParse({
    containerNumber,
    checkDigit,
    documentType
  })

  if (!parsed.success) {
    return sendApiError('Validation Failed', 422, parsed.error.flatten())
  }

  const document = await publicContainerService.uploadDocument({
    containerNumber: parsed.data.containerNumber,
    checkDigit: parsed.data.checkDigit,
    documentType: parsed.data.documentType,
    fileName: filePart.filename,
    mimeType: filePart.type || undefined,
    data: Buffer.from(filePart.data)
  })

  return sendSuccess(document, 'Document uploaded successfully')
})
