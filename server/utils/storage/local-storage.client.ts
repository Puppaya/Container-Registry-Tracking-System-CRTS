import { mkdir, writeFile, unlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { StorageClient, StoredObject } from '../../types/storage'

export function createLocalStorageClient(basePath: string): StorageClient {
  async function ensureDir(filePath: string) {
    await mkdir(dirname(filePath), { recursive: true })
  }

  return {
    async upload(key, data, contentType) {
      const filePath = join(basePath, key)
      await ensureDir(filePath)
      await writeFile(filePath, data)

      return {
        key,
        contentType,
        size: data.length
      }
    },

    async delete(key) {
      const filePath = join(basePath, key)
      await unlink(filePath).catch(() => undefined)
    },

    async getPresignedDownloadUrl(key, fileName, options) {
      const params = new URLSearchParams({
        key,
        fileName,
        ...(options?.inline ? { inline: '1' } : {})
      })
      return `/api/storage/local?${params.toString()}`
    },

    getLocalFilePath(key) {
      return join(basePath, key)
    }
  }
}
