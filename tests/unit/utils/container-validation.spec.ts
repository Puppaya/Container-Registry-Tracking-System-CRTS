import { describe, it, expect } from 'vitest'
import {
  calculateCheckDigit,
  generateContainerNumber,
  normalizeContainerNumber,
  resolveContainerNumberInput,
  validateContainerNumber
} from '../../../app/utils/container-validation'

describe('container-validation', () => {
  describe('normalizeContainerNumber', () => {
    it('should remove spaces and hyphens and uppercase', () => {
      expect(normalizeContainerNumber('mscu 123456-6')).toBe('MSCU1234566')
    })
  })

  describe('calculateCheckDigit', () => {
    it('should calculate ISO 6346 check digit for known prefix', () => {
      expect(calculateCheckDigit('MSCU123456')).toBe(6)
    })
  })

  describe('generateContainerNumber', () => {
    it('should append valid check digit to prefix', () => {
      expect(generateContainerNumber('MSCU123456')).toBe('MSCU1234566')
    })
  })

  describe('validateContainerNumber', () => {
    it('should accept valid container number', () => {
      const result = validateContainerNumber('MSCU1234566')

      expect(result.valid).toBe(true)
      expect(result.normalized).toBe('MSCU1234566')
    })

    it('should reject invalid check digit', () => {
      const result = validateContainerNumber('MSCU1234560')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('6')
    })

    it('should reject invalid format', () => {
      const result = validateContainerNumber('ABC123')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('ISO 6346')
    })
  })

  describe('resolveContainerNumberInput', () => {
    it('should append check digit from 10-char prefix', () => {
      expect(resolveContainerNumberInput('MSCU123456')).toBe('MSCU1234566')
    })

    it('should fix wrong check digit on full input', () => {
      expect(resolveContainerNumberInput('MSCU1234567')).toBe('MSCU1234566')
    })
  })
})
