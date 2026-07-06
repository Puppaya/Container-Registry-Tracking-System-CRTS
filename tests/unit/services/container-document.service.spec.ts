import { describe, it, expect, vi, beforeEach } from 'vitest'
import { containerDocumentService } from '../../../server/services/container-document.service'
import {
  containerDocumentRepository,
  containerRepository
} from '../../../server/utils/repositories'

vi.mock('../../../server/utils/repositories', () => ({
  containerRepository: {
    findByContainerId: vi.fn()
  },
  containerDocumentRepository: {
    findByContainerId: vi.fn(),
    findByDocumentId: vi.fn(),
    createDocument: vi.fn(),
    deleteByDocumentId: vi.fn()
  }
}))

const uploadMock = vi.fn()
const deleteMock = vi.fn()
const getPresignedDownloadUrlMock = vi.fn()
const getLocalFilePathMock = vi.fn()

vi.mock('../../../server/utils/storage', () => ({
  buildDocumentStorageKey: vi.fn(() => 'containers/1/test.pdf'),
  getStorageClient: vi.fn(() => ({
    upload: uploadMock,
    delete: deleteMock,
    getPresignedDownloadUrl: getPresignedDownloadUrlMock,
    getLocalFilePath: getLocalFilePathMock
  })),
  getStorageConfig: vi.fn(() => ({
    provider: 'local',
    localPath: '/tmp/storage'
  }))
}))

describe('ContainerDocumentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listDocuments', () => {
    it('should return container and documents', async () => {
      const mockContainer = { containerId: 1, containerNumber: 'MSCU1234566' }
      const mockDocuments = [{ documentId: 1, fileName: 'test.pdf' }]

      vi.mocked(containerRepository.findByContainerId).mockResolvedValue(mockContainer as any)
      vi.mocked(containerDocumentRepository.findByContainerId).mockResolvedValue(mockDocuments as any)

      const result = await containerDocumentService.listDocuments(1)

      expect(result.container).toEqual(mockContainer)
      expect(result.documents).toEqual(mockDocuments)
    })

    it('should throw 404 when container not found', async () => {
      vi.mocked(containerRepository.findByContainerId).mockResolvedValue(null)

      await expect(containerDocumentService.listDocuments(999))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('uploadDocument', () => {
    it('should upload file and create document record', async () => {
      vi.mocked(containerRepository.findByContainerId).mockResolvedValue({ containerId: 1 } as any)
      uploadMock.mockResolvedValue({ key: 'containers/1/test.pdf', size: 4 })
      vi.mocked(containerDocumentRepository.createDocument).mockResolvedValue({
        documentId: 10,
        fileName: 'test.pdf'
      } as any)

      const result = await containerDocumentService.uploadDocument({
        containerId: 1,
        documentType: 'Survey',
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        data: Buffer.from('test'),
        actor: 'admin'
      })

      expect(uploadMock).toHaveBeenCalled()
      expect(result.documentId).toBe(10)
    })

    it('should reject invalid file type', async () => {
      vi.mocked(containerRepository.findByContainerId).mockResolvedValue({ containerId: 1 } as any)

      await expect(containerDocumentService.uploadDocument({
        containerId: 1,
        documentType: 'Other',
        fileName: 'bad.exe',
        data: Buffer.from('test'),
        actor: 'admin'
      })).rejects.toMatchObject({ statusCode: 422 })
    })
  })

  describe('deleteDocument', () => {
    it('should delete storage object and database record', async () => {
      vi.mocked(containerRepository.findByContainerId).mockResolvedValue({ containerId: 1 } as any)
      vi.mocked(containerDocumentRepository.findByDocumentId).mockResolvedValue({
        documentId: 5,
        containerId: 1,
        fileUrl: 'containers/1/test.pdf'
      } as any)

      await containerDocumentService.deleteDocument(1, 5, 'admin')

      expect(deleteMock).toHaveBeenCalledWith('containers/1/test.pdf')
      expect(containerDocumentRepository.deleteByDocumentId).toHaveBeenCalledWith(5)
    })
  })
})
