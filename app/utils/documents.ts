import type { ContainerDocument } from '~/types'

export const DOCUMENT_TYPES = [
  { label: 'Registration', value: 'Registration' },
  { label: 'Survey', value: 'Survey' },
  { label: 'Repair', value: 'Repair' },
  { label: 'Maintenance', value: 'Maintenance' },
  { label: 'Certificate', value: 'Certificate' },
  { label: 'Other', value: 'Other' }
]

export function getDocumentDownloadUrl(containerId: number, documentId: number) {
  return `/api/containers/${containerId}/documents/${documentId}/download`
}

export function getDocumentPreviewUrl(
  containerId: number,
  documentId: number,
  document?: Pick<ContainerDocument, 'publicUrl'>
) {
  if (document?.publicUrl) {
    return document.publicUrl
  }

  return `/api/containers/${containerId}/documents/${documentId}/preview`
}

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp'])

export function isImageDocument(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  return IMAGE_EXTENSIONS.has(extension)
}
