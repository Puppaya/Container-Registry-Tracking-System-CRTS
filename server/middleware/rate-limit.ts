const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

const LIMIT = 100 // max requests
const WINDOW = 60 * 1000 // 1 minute

export default defineEventHandler((event) => {
  const path = getRequestPath(event)
  
  // Apply to sensitive routes (login, register, public portal)
  if (path.startsWith('/api/auth/') || path.startsWith('/api/public/')) {
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const now = Date.now()
    
    let record = rateLimitMap.get(ip)
    
    if (!record || (now - record.lastReset) > WINDOW) {
      record = { count: 0, lastReset: now }
    }
    
    record.count++
    rateLimitMap.set(ip, record)
    
    if (record.count > LIMIT) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests, please try again later'
      })
    }
  }
})
