import { auditLogService } from '../../services/audit-log.service'

export default defineEventHandler(async (event) => {
  await requireAdministrator(event)

  const query = validateQuery(event, AuditLogListQuerySchema)
  const result = await auditLogService.getAuditLogs(query)

  return sendSuccess(result)
})
