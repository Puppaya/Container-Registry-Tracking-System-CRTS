import type { StorageClient } from '../../types/storage'
import { getStorageConfig } from './config'
import { createLocalStorageClient } from './local-storage.client'
import { createS3StorageClient } from './s3-storage.client'

let storageClient: StorageClient | null = null

export function getStorageClient(): StorageClient {
  if (storageClient) {
    return storageClient
  }

  const config = getStorageConfig()
  storageClient = config.provider === 's3'
    ? createS3StorageClient(config)
    : createLocalStorageClient(config.localPath)

  return storageClient
}

export function buildDocumentStorageKey(containerId: number, fileName: string): string {
  const safeName = fileName
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 120)

  return `containers/${containerId}/${Date.now()}-${safeName}`
}