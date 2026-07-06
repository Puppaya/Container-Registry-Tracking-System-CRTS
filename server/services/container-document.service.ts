import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import {
  containerDocumentRepository,
  containerRepository
} from '../utils/repositories'
import {
  buildDocumentStorageKey,
  getStorageClient
} from '../utils/storage'
import { getStorageConfig } from '../utils/storage/config'
import { buildPublicStorageUrl, withDocumentPublicUrl } from '../utils/storage/public-url'
import { validateUploadedFile, getMimeTypeFromFileName } from '../utils/document-validation'
import { logAudit } from '../utils/audit-log'

export interface UploadDocumentInput {
  containerId: number
  documentType: string
  fileName: string
  mimeType?: string
  data: Buffer
  actor: string
}

export class ContainerDocumentService {
  async listDocuments(containerId: number) {
    const container = await containerRepository.findByContainerId(containerId)
    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    const documents = await containerDocumentRepository.findByContainerId(containerId)
    return {
      container,
      documents: documents.map(doc => withDocumentPublicUrl(doc))
    }
  }

  async uploadDocument(input: UploadDocumentInput) {
    const container = await containerRepository.findByContainerId(input.containerId)
    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    const validation = validateUploadedFile({
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: input.data.length
    })

    if (!validation.valid) {
      throw createError({
        statusCode: 422,
        statusMessage: validation.error
      })
    }

    const storageKey = buildDocumentStorageKey(input.containerId, input.fileName)
    const contentType = input.mimeType || getMimeTypeFromFileName(input.fileName)
    const storage = getStorageClient()

    await storage.upload(storageKey, input.data, contentType)

    try {
      const document = await containerDocumentRepository.createDocument({
        containerId: input.containerId,
        documentType: input.documentType,
        fileName: input.fileName,
        fileUrl: storageKey,
        uploadedBy: input.actor
      })

      await logAudit({
        action: 'document.upload',
        actor: input.actor,
        entityType: 'container_document',
        entityId: document.documentId,
        details: {
          containerId: input.containerId,
          documentType: input.documentType,
          fileName: input.fileName
        }
      })

      return document
    } catch (error) {
      await storage.delete(storageKey).catch(() => undefined)
      throw error
    }
  }

  async deleteDocument(containerId: number, documentId: number, actor: string) {
    const document = await this.getDocumentForContainer(containerId, documentId)
    const storage = getStorageClient()

    await storage.delete(document.fileUrl)
    await containerDocumentRepository.deleteByDocumentId(documentId)

    await logAudit({
      action: 'document.delete',
      actor,
      entityType: 'container_document',
      entityId: documentId,
      details: {
        containerId,
        fileName: document.fileName
      }
    })

    return { documentId }
  }

  async getDownloadTarget(containerId: number, documentId: number) {
    return this.getFileTarget(containerId, documentId, 'attachment')
  }

  async getPreviewTarget(containerId: number, documentId: number) {
    return this.getFileTarget(containerId, documentId, 'inline')
  }

  private async getFileTarget(
    containerId: number,
    documentId: number,
    disposition: 'attachment' | 'inline'
  ) {
    const document = await this.getDocumentForContainer(containerId, documentId)
    const storage = getStorageClient()
    const config = getStorageConfig()
    const contentType = getMimeTypeFromFileName(document.fileName)

    if (disposition === 'inline') {
      const publicUrl = buildPublicStorageUrl(document.fileUrl, config)
      if (publicUrl) {
        return {
          mode: 'redirect' as const,
          url: publicUrl
        }
      }
    }

    if (config.provider === 'local') {
      const filePath = storage.getLocalFilePath(document.fileUrl)
      if (!filePath) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Local storage path unavailable'
        })
      }

      try {
        await stat(filePath)
      } catch {
        throw createError({
          statusCode: 404,
          statusMessage: 'File not found in storage'
        })
      }

      return {
        mode: 'stream' as const,
        filePath,
        fileName: document.fileName,
        contentType,
        disposition
      }
    }

    const url = await storage.getPresignedDownloadUrl(document.fileUrl, document.fileName, {
      inline: disposition === 'inline'
    })

    return {
      mode: 'redirect' as const,
      url
    }
  }

  private async getDocumentForContainer(containerId: number, documentId: number) {
    const container = await containerRepository.findByContainerId(containerId)
    if (!container) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Container not found'
      })
    }

    const document = await containerDocumentRepository.findByDocumentId(documentId)
    if (!document || document.containerId !== containerId) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Document not found'
      })
    }

    return document
  }
}

export const containerDocumentService = new ContainerDocumentService()

export function streamLocalDownload(filePath: string) {
  return createReadStream(filePath)
}
