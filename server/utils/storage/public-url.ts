import type { StorageConfig } from '../../types/storage'
import { getStorageConfig } from './config'

export function buildPublicStorageUrl(storageKey: string, config?: StorageConfig): string | null {
  const cfg = config ?? getStorageConfig()
  const base = cfg.s3PublicUrl?.trim().replace(/\/+$/, '')

  if (!base || cfg.provider !== 's3' || !storageKey.trim()) {
    return null
  }

  const key = storageKey.trim().replace(/^\/+/, '')
  return `${base}/${cfg.s3Bucket}/${key}`
}

export function withDocumentPublicUrl<T extends { fileUrl: string }>(document: T, config?: StorageConfig) {
  return {
    ...document,
    publicUrl: buildPublicStorageUrl(document.fileUrl, config)
  }
}
