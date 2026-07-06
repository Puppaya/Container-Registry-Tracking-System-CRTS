export type StorageProvider = 's3' | 'local'

export interface StorageConfig {
  provider: StorageProvider
  localPath: string
  s3Endpoint: string
  s3AccessKey: string
  s3SecretKey: string
  s3Bucket: string
  s3Region: string
  s3PublicUrl: string
}

export interface StoredObject {
  key: string
  contentType: string
  size: number
}

export interface StorageClient {
  upload(key: string, data: Buffer, contentType: string): Promise<StoredObject>
  delete(key: string): Promise<void>
  getPresignedDownloadUrl(key: string, fileName: string, options?: { inline?: boolean, expiresInSeconds?: number }): Promise<string>
  getLocalFilePath(key: string): string | null
}
