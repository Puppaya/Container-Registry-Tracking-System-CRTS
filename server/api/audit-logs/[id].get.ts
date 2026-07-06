import { auditLogService } from '../../services/audit-log.service'

export default defineEventHandler(async (event) => {
  await requireAdministrator(event)

  const auditLogId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(auditLogId)) {
    return sendApiError('Invalid audit log ID', 400)
  }

  const record = await auditLogService.getAuditLog(auditLogId)
  return sendSuccess(record)
})
