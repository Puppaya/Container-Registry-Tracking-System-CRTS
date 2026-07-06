import { describe, expect, it } from 'vitest'
import {
  autoFillCheckDigit,
  buildContainerPayload,
  containerRegistrationSchema,
  createDefaultRegistrationState,
  formatDecimalInput,
  formatIntegerInput,
  validateBicDocument,
  validateContainerPrefixAndDigit
} from '~/utils/container-registration'

describe('container-registration utils', () => {
  it('calculates check digit for a valid prefix', () => {
    expect(autoFillCheckDigit('MSCU123456')).toBe('6')
  })

  it('validates container prefix and check digit', () => {
    const result = validateContainerPrefixAndDigit('MSCU123456', '6')
    expect(result.valid).toBe(true)
    expect(result.normalized).toBe('MSCU1234566')
  })

  it('builds API payload from form state', () => {
    const state = createDefaultRegistrationState()
    state.containerPrefix = 'MSCU123456'
    state.checkDigit = '6'
    state.owner = 'Mediterranean Shipping Co.'
    state.isoType = '42G1'
    state.tareWeight = '3750'
    state.maxPayload = '28750'
    state.internalVolume = '67.7'
    state.leaseProvider = 'Triton International'
    state.registryLocation = 'Port of Rotterdam (NLRTM)'
    state.cscExpiryDate = '2028-12-31'

    const payload = buildContainerPayload(state, true)

    expect(payload.containerNumber).toBe('MSCU1234566')
    expect(payload.owner).toBe('Mediterranean Shipping Co.')
    expect(payload.isoType).toBe('42G1')
    expect(payload.tareWeight).toBe(3750)
    expect(payload.maxPayload).toBe(28750)
    expect(payload.internalVolume).toBe(67.7)
    expect(payload.leaseProvider).toBe('Triton International')
    expect(payload.registryLocation).toBe('Port of Rotterdam (NLRTM)')
    expect(payload.cscExpiryDate).toBe('2028-12-31')
  })

  it('rejects files larger than 10MB', () => {
    const file = new File([new ArrayBuffer(11 * 1024 * 1024)], 'cert.pdf', { type: 'application/pdf' })
    const result = validateBicDocument(file)
    expect(result.valid).toBe(false)
  })

  it('formats integer inputs with thousand separators', () => {
    expect(formatIntegerInput('3750')).toBe('3,750')
    expect(formatIntegerInput('28750')).toBe('28,750')
    expect(formatIntegerInput('3,750')).toBe('3,750')
  })

  it('formats decimal inputs with thousand separators', () => {
    expect(formatDecimalInput('67.7')).toBe('67.7')
    expect(formatDecimalInput('1234.5')).toBe('1,234.5')
  })

  it('builds API payload from comma-formatted form state', () => {
    const state = createDefaultRegistrationState()
    state.containerPrefix = 'MSCU123456'
    state.checkDigit = '6'
    state.owner = 'Mediterranean Shipping Co.'
    state.isoType = '42G1'
    state.tareWeight = '3,750'
    state.maxPayload = '28,750'
    state.internalVolume = '1,234.5'

    const payload = buildContainerPayload(state, true)

    expect(payload.tareWeight).toBe(3750)
    expect(payload.maxPayload).toBe(28750)
    expect(payload.internalVolume).toBe(1234.5)
  })

  it('accepts numeric field values from number inputs', () => {
    const result = containerRegistrationSchema.safeParse({
      containerPrefix: 'MSCU123456',
      checkDigit: '6',
      unitStatus: 'New',
      isoType: '42G1',
      containerSize: '40',
      containerCategory: 'Dry',
      tareWeight: 3750,
      maxPayload: 28750,
      internalVolume: 67.7,
      owner: 'Mediterranean Shipping Co.',
      leaseProvider: '',
      manufacturer: '',
      yearBuilt: 2024,
      registryLocation: '',
      cscExpiryDate: '',
      registrationDate: '2026-07-03',
      certified: true
    })

    expect(result.success).toBe(true)
  })

  it('accepts comma-formatted numeric field values', () => {
    const result = containerRegistrationSchema.safeParse({
      containerPrefix: 'MSCU123456',
      checkDigit: '6',
      unitStatus: 'New',
      isoType: '42G1',
      containerSize: '40',
      containerCategory: 'Dry',
      tareWeight: '3,750',
      maxPayload: '28,750',
      internalVolume: '67.7',
      owner: 'Mediterranean Shipping Co.',
      leaseProvider: '',
      manufacturer: '',
      yearBuilt: '',
      registryLocation: '',
      cscExpiryDate: '',
      registrationDate: '2026-07-03',
      certified: true
    })

    expect(result.success).toBe(true)
  })
})
