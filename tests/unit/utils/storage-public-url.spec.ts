import { describe, it, expect } from 'vitest'
import { buildPublicStorageUrl } from '../../../server/utils/storage/public-url'

describe('buildPublicStorageUrl', () => {
  const config = {
    provider: 's3' as const,
    localPath: '/tmp',
    s3Endpoint: 'http://10.0.200.105:9000',
    s3AccessKey: 'admin',
    s3SecretKey: 'secret',
    s3Bucket: 'crts',
    s3Region: 'us-east-1',
    s3PublicUrl: 'https://sdp-server-file.sdplao.com:4430'
  }

  it('should build public object url from return path and storage key', () => {
    const url = buildPublicStorageUrl('containers/1/photo.png', config)
    expect(url).toBe('https://sdp-server-file.sdplao.com:4430/crts/containers/1/photo.png')
  })

  it('should return null when public url is not configured', () => {
    expect(buildPublicStorageUrl('containers/1/photo.png', { ...config, s3PublicUrl: '' })).toBeNull()
  })
})
