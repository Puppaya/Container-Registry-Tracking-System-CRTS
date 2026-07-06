import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import type { StorageClient, StorageConfig, StoredObject } from '../../types/storage'

export function createS3StorageClient(config: StorageConfig): StorageClient {
  const client = new S3Client({
    region: config.s3Region,
    endpoint: config.s3Endpoint,
    credentials: {
      accessKeyId: config.s3AccessKey,
      secretAccessKey: config.s3SecretKey
    },
    forcePathStyle: true
  })

  return {
    async upload(key, data, contentType) {
      await client.send(new PutObjectCommand({
        Bucket: config.s3Bucket,
        Key: key,
        Body: data,
        ContentType: contentType
      }))

      return {
        key,
        contentType,
        size: data.length
      }
    },

    async delete(key) {
      await client.send(new DeleteObjectCommand({
        Bucket: config.s3Bucket,
        Key: key
      }))
    },

    async getPresignedDownloadUrl(key, fileName, options) {
      const disposition = options?.inline
        ? `inline; filename="${encodeURIComponent(fileName)}"`
        : `attachment; filename="${encodeURIComponent(fileName)}"`

      const command = new GetObjectCommand({
        Bucket: config.s3Bucket,
        Key: key,
        ResponseContentDisposition: disposition
      })

      return getSignedUrl(client, command, { expiresIn: options?.expiresInSeconds ?? 3600 })
    },

    getLocalFilePath() {
      return null
    }
  }
}
