import { describe, it, expect } from 'vitest'
import { resolveCurrentStatus } from '../../../server/utils/container-location'

describe('resolveCurrentStatus', () => {
  it('should use latest movement location when movement exists', () => {
    const result = resolveCurrentStatus('Active', {
      eventType: 'GateIn',
      eventDescription: 'Yard A, Block 3',
      eventDate: new Date('2026-06-01T10:00:00Z')
    }, 'Port Registry')

    expect(result.currentLocation).toBe('Yard A, Block 3')
    expect(result.locationSource).toBe('movement')
    expect(result.lastMovementType).toBe('GateIn')
    expect(result.lastUpdated).toBe('2026-06-01T10:00:00.000Z')
  })

  it('should fall back to registry location when no movement exists', () => {
    const result = resolveCurrentStatus('Active', null, 'Port of Rotterdam (NLRTM)')

    expect(result.currentLocation).toBe('Port of Rotterdam (NLRTM)')
    expect(result.locationSource).toBe('registry')
    expect(result.lastMovementType).toBeNull()
  })

  it('should return unknown when no movement or registry location exists', () => {
    const result = resolveCurrentStatus('Inactive', null, null)

    expect(result.currentLocation).toBeNull()
    expect(result.locationSource).toBe('unknown')
  })
})
