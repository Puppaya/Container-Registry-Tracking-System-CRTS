import { describe, expect, it } from 'vitest'
import { mapPublicTrackResponse } from '../../../server/utils/public-container-mapper'

describe('mapPublicTrackResponse', () => {
  it('should strip submitter details from timeline descriptions', () => {
    const result = mapPublicTrackResponse({
      container: {
        containerNumber: 'MSCU1234567',
        isoType: '42G1',
        containerSize: '40',
        containerCategory: 'Dry',
        owner: 'ACME',
        registrationDate: new Date('2026-01-01'),
        status: 'Pending'
      },
      currentStatus: {
        operationalStatus: 'Active',
        currentLocation: null,
        locationSource: 'unknown',
        lastMovementType: null,
        lastUpdated: null
      },
      latestSurvey: null,
      recentMovements: [],
      timeline: [{
        eventType: 'Registration',
        eventDate: new Date('2026-01-01'),
        eventDescription: 'Public registration request REG-20260101-ABC123\nSubmitter: John\nEmail: john@example.com'
      }],
      registrationReference: 'REG-20260101-ABC123'
    })

    expect(result.timeline[0]?.eventDescription).toBe('Container registered')
    expect(result.container.status).toBe('Pending')
    expect(result.registrationReference).toBe('REG-20260101-ABC123')
  })

  it('should keep movement descriptions for gate events', () => {
    const result = mapPublicTrackResponse({
      container: {
        containerNumber: 'MSCU1234567',
        isoType: '42G1',
        containerSize: '40',
        containerCategory: 'Dry',
        owner: 'ACME',
        registrationDate: new Date('2026-01-01'),
        status: 'Active'
      },
      currentStatus: {
        operationalStatus: 'Active',
        currentLocation: 'Yard A',
        locationSource: 'movement',
        lastMovementType: 'GateIn',
        lastUpdated: '2026-01-02T00:00:00.000Z'
      },
      latestSurvey: {
        surveyDate: new Date('2026-01-03'),
        result: 'Pass'
      },
      recentMovements: [{
        eventType: 'GateIn',
        eventDate: new Date('2026-01-02'),
        eventDescription: 'Yard A'
      }],
      timeline: [{
        eventType: 'GateIn',
        eventDate: new Date('2026-01-02'),
        eventDescription: 'Yard A'
      }]
    })

    expect(result.recentMovements[0]?.eventDescription).toBe('Yard A')
    expect(result.latestSurvey?.result).toBe('Pass')
  })
})
