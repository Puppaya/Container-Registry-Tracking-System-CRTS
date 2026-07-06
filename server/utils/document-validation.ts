const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'doc',
  'docx',
  'xls',
  'xlsx'
])

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream'
])

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024

export const DOCUMENT_TYPES = [
  'Registration',
  'Survey',
  'Repair',
  'Maintenance',
  'Certificate',
  'Other'
] as const

export type DocumentType = typeof DOCUMENT_TYPES[number]

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.')
  if (parts.length < 2) return ''
  return parts.pop()!.toLowerCase()
}

const EXTENSION_MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

export function getMimeTypeFromFileName(fileName: string): string {
  const extension = getFileExtension(fileName)
  return EXTENSION_MIME_MAP[extension] || 'application/octet-stream'
}

export function validateUploadedFile(input: {
  fileName: string
  mimeType?: string
  size: number
}): { valid: true } | { valid: false, error: string } {
  if (input.size <= 0) {
    return { valid: false, error: 'File is empty' }
  }

  if (input.size > MAX_DOCUMENT_SIZE_BYTES) {
    return { valid: false, error: 'File exceeds maximum size of 10MB' }
  }

  const extension = getFileExtension(input.fileName)
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
    return { valid: false, error: 'File type is not allowed' }
  }

  if (input.mimeType && !ALLOWED_MIME_TYPES.has(input.mimeType)) {
    return { valid: false, error: 'MIME type is not allowed' }
  }

  return { valid: true }
}
