import { describe, it, expect } from 'vitest'
import { extractSurveyInboundRecords } from '../../../server/utils/survey-inbound'

describe('survey-inbound utils', () => {
  describe('extractSurveyInboundRecords', () => {
    it('should extract a single record body', () => {
      const record = {
        surveyReferenceNo: 'SRV-2026-0100',
        containerNumber: 'MSCU1234566',
        surveyDate: new Date('2026-07-01T08:00:00+07:00'),
        result: 'Pass'
      }

      expect(extractSurveyInboundRecords(record)).toEqual([record])
    })

    it('should extract records from batch body', () => {
      const records = [
        {
          surveyReferenceNo: 'SRV-2026-0100',
          containerNumber: 'MSCU1234566',
          surveyDate: new Date('2026-07-01T08:00:00+07:00'),
          result: 'Pass'
        },
        {
          surveyReferenceNo: 'SRV-2026-0101',
          containerNumber: 'HLCU6543210',
          surveyDate: new Date('2026-07-01T09:30:00+07:00'),
          result: 'Fail'
        }
      ]

      expect(extractSurveyInboundRecords({ records })).toEqual(records)
    })
  })
})
