import { describe, it, expect } from 'vitest'
import {
  getAuditSyncItems,
  isAuditSyncDetails
} from '../../../app/utils/audit-actions'

describe('audit-actions', () => {
  it('should detect sync summary details', () => {
    expect(isAuditSyncDetails({
      total: 1,
      created: 0,
      skipped: 1,
      failed: 0
    })).toBe(true)

    expect(isAuditSyncDetails({ containerNumber: 'MSCU1234567' })).toBe(false)
    expect(isAuditSyncDetails(null)).toBe(false)
  })

  it('should extract sync items from audit details', () => {
    const details = {
      total: 1,
      created: 0,
      skipped: 1,
      failed: 0,
      items: [{
        gateReferenceNo: 'GTE-2026-0001',
        containerNumber: 'MSCU1234567',
        status: 'skipped',
        reason: 'container_not_found'
      }]
    }

    expect(getAuditSyncItems(details)).toEqual(details.items)
    expect(getAuditSyncItems({ total: 1, created: 0, skipped: 0, failed: 0 })).toEqual([])
  })
})
