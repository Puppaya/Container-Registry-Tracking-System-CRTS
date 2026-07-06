export default defineEventHandler(() => {
  throw createError({
    statusCode: 503,
    statusMessage: 'Survey push integration is not enabled in Phase 1. CRTS pulls data via POST /api/survey/sync.'
  })
})
