import { H3Event } from 'h3'

const idempotencyKeys = new Map<string, { result: any; expires: number }>()

/**
 * Basic Idempotency Helper to prevent Replay Attacks (Checklist #9).
 * Usage: const result = await withIdempotency(event, async () => { ... logic ... })
 */
export const withIdempotency = async (event: H3Event, handler: () => Promise<any>) => {
  const key = getHeader(event, 'x-idempotency-key')
  
  if (!key) return await handler()
  
  const existing = idempotencyKeys.get(key)
  if (existing && existing.expires > Date.now()) {
    return existing.result
  }
  
  const result = await handler()
  
  // Cache result for 1 hour
  idempotencyKeys.set(key, { 
    result, 
    expires: Date.now() + (60 * 60 * 1000) 
  })
  
  return result
}
