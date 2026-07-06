import { describe, it, expect } from 'vitest'
import { extractGateInboundRecords } from '../../../server/utils/gate-inbound'

describe('gate-inbound utils', () => {
  describe('extractGateInboundRecords', () => {
    it('should extract a single record body', () => {
      const record = {
        gateReferenceNo: 'GTE-2026-0100',
        containerNumber: 'MSCU1234567',
        eventType: 'GateIn' as const,
        eventDate: new Date('2026-07-01T08:00:00+07:00'),
        location: 'Main Gate 1 / Yard A',
        vehiclePlateNo: 'LA-1234'
      }

      expect(extractGateInboundRecords(record)).toEqual([record])
    })

    it('should extract records from batch body', () => {
      const records = [
        {
          gateReferenceNo: 'GTE-2026-0100',
          containerNumber: 'MSCU1234567',
          eventType: 'GateIn' as const,
          eventDate: new Date('2026-07-01T08:00:00+07:00'),
          location: 'Main Gate 1 / Yard A',
          vehiclePlateNo: 'LA-1234'
        },
        {
          gateReferenceNo: 'GTE-2026-0101',
          containerNumber: 'HLCU6543210',
          eventType: 'GateOut' as const,
          eventDate: new Date('2026-07-01T10:00:00+07:00'),
          location: 'Main Gate 2 / Exit',
          vehiclePlateNo: 'LA-9012'
        }
      ]

      expect(extractGateInboundRecords({ records })).toEqual(records)
    })
  })
})
