import { describe, it, expect } from 'vitest'
import {
  validateUploadedFile,
  getMimeTypeFromFileName,
  MAX_DOCUMENT_SIZE_BYTES
} from '../../../server/utils/document-validation'

describe('document-validation', () => {
  it('should accept valid pdf file', () => {
    const result = validateUploadedFile({
      fileName: 'report.pdf',
      mimeType: 'application/pdf',
      size: 1024
    })

    expect(result.valid).toBe(true)
  })

  it('should reject empty file', () => {
    const result = validateUploadedFile({
      fileName: 'report.pdf',
      size: 0
    })

    expect(result).toEqual({ valid: false, error: 'File is empty' })
  })

  it('should reject oversized file', () => {
    const result = validateUploadedFile({
      fileName: 'large.pdf',
      size: MAX_DOCUMENT_SIZE_BYTES + 1
    })

    expect(result).toEqual({ valid: false, error: 'File exceeds maximum size of 10MB' })
  })

  it('should reject unsupported extension', () => {
    const result = validateUploadedFile({
      fileName: 'script.exe',
      size: 100
    })

    expect(result).toEqual({ valid: false, error: 'File type is not allowed' })
  })

  it('should map mime type from file name', () => {
    expect(getMimeTypeFromFileName('photo.JPG')).toBe('image/jpeg')
    expect(getMimeTypeFromFileName('sheet.xlsx')).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
  })
})
