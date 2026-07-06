import type { H3Event } from 'h3'
import type { z } from 'zod'
import type { ExternalSurveyRecord } from '../types/survey'
import {
  SurveyInboundBodySchema,
  type SurveyInboundBody
} from './validation'

export function extractSurveyInboundRecords(body: SurveyInboundBody): ExternalSurveyRecord[] {
  if ('records' in body) {
    return body.records
  }

  return [body]
}

export async function validateSurveyInboundBody(event: H3Event): Promise<SurveyInboundBody> {
  const body = await readBody(event).catch(() => ({}))
  const result = SurveyInboundBodySchema.safeParse(body ?? {})

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
