import { describe, expect, it } from 'vitest'
import { generatePublicRegistrationReference } from '../../../server/utils/public-container-reference'

describe('generatePublicRegistrationReference', () => {
  it('should generate reference with REG prefix and date segment', () => {
    const reference = generatePublicRegistrationReference(new Date('2026-08-13T10:00:00.000Z'))
    expect(reference).toMatch(/^REG-20260813-[A-F0-9]{6}$/)
  })
})
