import { surveySyncService } from '../services/survey-sync.service'
import { dbLogger } from '../utils/logger'

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000

export default defineNitroPlugin(() => {
  if (process.env.SURVEY_SYNC_ENABLED === 'false') {
    dbLogger.info('Survey scheduled sync is disabled')
    return
  }

  const runSync = async () => {
    try {
      const summary = await surveySyncService.syncAll('system-scheduler')
      dbLogger.info(`Survey scheduled sync finished: created=${summary.created}, skipped=${summary.skipped}, failed=${summary.failed}`)
    } catch (error) {
      dbLogger.error('Survey scheduled sync failed', error)
    }
  }

  setTimeout(runSync, 30_000)
  setInterval(runSync, FIFTEEN_MINUTES_MS)

  dbLogger.info('Survey scheduled sync started (every 15 minutes)')
})
