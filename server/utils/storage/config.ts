import { join } from 'node:path'
import type { StorageConfig } from '../../types/storage'

export function getStorageConfig(): StorageConfig {
  const config = useRuntimeConfig()

  const s3Endpoint = String(config.s3Endpoint || process.env.S3_ENDPOINT || '').trim()
  const s3AccessKey = String(config.s3AccessKey || process.env.S3_ACCESS_KEY || '').trim()
  const s3SecretKey = String(config.s3SecretKey || process.env.S3_SECRET_KEY || '').trim()

  const useS3 = Boolean(s3Endpoint && s3AccessKey && s3SecretKey)

  return {
    provider: useS3 ? 's3' : 'local',
    localPath: String(config.storageLocalPath || process.env.STORAGE_LOCAL_PATH || join(process.cwd(), '.data/storage')),
    s3Endpoint,
    s3AccessKey,
    s3SecretKey,
    s3Bucket: String(config.s3Bucket || process.env.S3_BUCKET || 'crts-documents'),
    s3Region: String(config.s3Region || process.env.S3_REGION || 'us-east-1'),
    s3PublicUrl: String(
      config.s3PublicUrl
      || process.env.S3_PUBLIC_URL
      || process.env.MINIO_RETURN_PATH
      || ''
    ).trim()
  }
}
