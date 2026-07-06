import type { H3Event } from 'h3'
import type { z } from 'zod'
import type { ExternalGateRecord } from '../types/gate'
import {
  GateInboundBodySchema,
  type GateInboundBody
} from './validation'

export function extractGateInboundRecords(body: GateInboundBody): ExternalGateRecord[] {
  if ('records' in body) {
    return body.records
  }

  return [body]
}

export async function validateGateInboundBody(event: H3Event): Promise<GateInboundBody> {
  const body = await readBody(event).catch(() => ({}))
  const result = GateInboundBodySchema.safeParse(body ?? {})

  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Failed',
      data: {
        success: false,
        message: 'Validation Failed',
        errors: formatZodFieldErrors(result.error)
      }
    })
  }

  return result.data
}

function formatZodFieldErrors(error: z.ZodError) {
  return error.issues.map(issue => ({
    field: issue.path.join('.') || 'body',
    message: issue.message
  }))
}
