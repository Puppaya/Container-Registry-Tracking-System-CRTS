import { apiLogger } from '../utils/logger'

/** Performance thresholds (ms) per design NFR */
const SLOW_THRESHOLDS: Array<{ pattern: RegExp, ms: number, label: string }> = [
  { pattern: /\/api\/containers(\?|$|\/search)/, ms: 2000, label: 'search' },
  { pattern: /\/api\/dashboard\//, ms: 3000, label: 'dashboard' }
]

function getSlowThreshold(url: string): { ms: number, label: string } | null {
  for (const threshold of SLOW_THRESHOLDS) {
    if (threshold.pattern.test(url)) {
      return { ms: threshold.ms, label: threshold.label }
    }
  }
  return null
}

export default defineEventHandler((event) => {
  const start = Date.now()
  const { method, url } = event.node.req

  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    const statusCode = event.node.res.statusCode
    const path = url || ''
    const logMsg = `${method} ${path} - ${statusCode} (${duration}ms)`

    const slowThreshold = getSlowThreshold(path)
    if (slowThreshold && duration > slowThreshold.ms && statusCode < 400) {
      apiLogger.warn(`${logMsg} [SLOW:${slowThreshold.label}] exceeds ${slowThreshold.ms}ms target`)
      return
    }

    if (statusCode >= 500) {
      apiLogger.error(logMsg)
    } else if (statusCode >= 400) {
      apiLogger.warn(logMsg)
    } else {
      apiLogger.info(logMsg)
    }
  })
})
