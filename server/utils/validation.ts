import { z } from 'zod'
import { H3Event } from 'h3'

/**
 * Validates request body against a Zod schema.
 * Throws 400 Bad Request if validation fails.
 */
export const validateBody = async <T extends z.ZodTypeAny>(event: H3Event, schema: T): Promise<z.infer<T>> => {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Failed',
      data: result.error.flatten()
    })
  }
  
  return result.data
}

/**
 * Validates request query against a Zod schema.
 */
export const validateQuery = <T extends z.ZodTypeAny>(event: H3Event, schema: T): Promise<z.infer<T>> => {
  const query = getQuery(event)
  const result = schema.safeParse(query)
  
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Query Parameters',
      data: result.error.flatten()
    })
  }
  
  return result.data
}
