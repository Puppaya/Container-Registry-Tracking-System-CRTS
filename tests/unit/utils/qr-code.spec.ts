import { describe, it, expect } from 'vitest'
import { buildContainerQrContent, parseQrScanInput } from '../../../server/utils/qr-code'

describe('qr-code utils', () => {
  describe('buildContainerQrContent', () => {
    it('should prefix container number with CRTS:', () => {
      expect(buildContainerQrContent('MSCU1234566')).toBe('CRTS:MSCU1234566')
    })
  })

  describe('parseQrScanInput', () => {
    it('should parse CRTS: prefixed content', () => {
      expect(parseQrScanInput('CRTS:MSCU1234566')).toEqual({
        containerNumber: 'MSCU1234566',
        qrContent: 'CRTS:MSCU1234566'
      })
    })

    it('should normalize raw container number input', () => {
      expect(parseQrScanInput(' mscu-1234566 ')).toEqual({
        containerNumber: 'MSCU1234566',
        qrContent: 'CRTS:MSCU1234566'
      })
    })
  })
})
