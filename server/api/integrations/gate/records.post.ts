import { gateSyncService } from '../../../services/gate-sync.service'
import { requireIntegrationApiKey } from '../../../utils/integration-auth'
import {
  extractGateInboundRecords,
  validateGateInboundBody
} from '../../../utils/gate-inbound'
import { withIdempotency } from '../../../utils/idempotency'
import { sendSuccess } from '../../../utils/api-response'
import { apiLogger } from '../../../utils/logger'

export default defineEventHandler(async (event) => {
  requireIntegrationApiKey(event)

  const body = await validateGateInboundBody(event)
  const records = extractGateInboundRecords(body)
  const isBatch = 'records' in body

  apiLogger.info(`Gate inbound: ${records.length} record(s)${isBatch ? ' (batch)' : ''}`)

  const summary = await withIdempotency(event, async () =>
    gateSyncService.syncInbound(records)
  )

  if (!isBatch) {
    const item = summary.items[0]

    if (item.status === 'created') {
      setResponseStatus(event, 201)
      return sendSuccess(item, 'Gate event record created')
    }

    return sendSuccess(item, 'Gate event record skipped')
  }

  return sendSuccess(
    {
      total: summary.total,
      created: summary.created,
      skipped: summary.skipped,
      failed: summary.failed,
      items: summary.items
    },
    'Gate event records processed'
  )
})
