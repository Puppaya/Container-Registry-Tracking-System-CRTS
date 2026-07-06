import https from 'node:https'
import http from 'node:http'
import type { ExternalSurveyRecord } from '../../types/survey'
import { fetchMockSurveys } from './mock-survey.client'
import { apiLogger } from '../../utils/logger'

export interface FetchSurveyResult {
  records: ExternalSurveyRecord[]
  source: 'external' | 'mock'
  containerNumber?: string
}

function getSurveyApiConfig() {
  const runtimeConfig = useRuntimeConfig()

  return {
    apiUrl: String(runtimeConfig.surveyApiUrl || process.env.SURVEY_API_URL || '').trim(),
    apiKey: String(runtimeConfig.surveyApiKey || process.env.SURVEY_API_KEY || '').trim(),
    tlsInsecure: runtimeConfig.surveyApiTlsInsecure === true
      || process.env.SURVEY_API_TLS_INSECURE === 'true'
  }
}

function normalizeRecords(payload: unknown): ExternalSurveyRecord[] {
  if (Array.isArray(payload)) {
    return payload as ExternalSurveyRecord[]
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: ExternalSurveyRecord[] }).data
  }

  return []
}

function shouldAllowInsecureTls(apiUrl: string, tlsInsecure: boolean): boolean {
  if (tlsInsecure) {
    return true
  }

  return process.env.NODE_ENV !== 'production'
    && /^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(apiUrl)
}

interface SurveyHttpError {
  statusCode: number
  message: string
  data?: unknown
}

async function requestSurveyApi(
  apiUrl: string,
  query: Record<string, string>,
  apiKey?: string,
  tlsInsecure = false
): Promise<unknown> {
  const url = new URL(apiUrl)

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value)
  }

  const isHttps = url.protocol === 'https:'
  const transport = isHttps ? https : http
  const defaultPort = isHttps ? 443 : 80

  return await new Promise((resolve, reject) => {
    const requestOptions: https.RequestOptions = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || defaultPort,
      path: `${url.pathname}${url.search}`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      timeout: 30_000,
      ...(isHttps && shouldAllowInsecureTls(apiUrl, tlsInsecure)
        ? { agent: new https.Agent({ rejectUnauthorized: false }) }
        : {})
    }

    const request = transport.request(requestOptions, (response) => {
      let body = ''

      response.setEncoding('utf8')
      response.on('data', chunk => { body += chunk })
      response.on('end', () => {
        let parsed: unknown = body

        try {
          parsed = body ? JSON.parse(body) : null
        } catch {
          parsed = body
        }

        const statusCode = response.statusCode || 500
        if (statusCode >= 400) {
          const message = typeof parsed === 'object' && parsed && 'message' in parsed
            ? String((parsed as { message?: string }).message || `Survey API returned ${statusCode}`)
            : `Survey API returned ${statusCode}`

          reject({
            statusCode,
            message,
            data: parsed
          } satisfies SurveyHttpError)
          return
        }

        resolve(parsed)
      })
    })

    request.on('timeout', () => {
      request.destroy()
      reject({
        statusCode: 504,
        message: 'Survey API request timed out'
      } satisfies SurveyHttpError)
    })

    request.on('error', (error) => {
      reject({
        statusCode: 502,
        message: error.message
      } satisfies SurveyHttpError)
    })

    request.end()
  })
}

export async function fetchExternalSurveys(containerNumber?: string): Promise<FetchSurveyResult> {
  const { apiUrl, apiKey, tlsInsecure } = getSurveyApiConfig()
  const normalizedContainerNumber = containerNumber?.toUpperCase().replace(/[\s-]/g, '')

  if (!apiUrl) {
    apiLogger.warn('SURVEY_API_URL is not configured — using mock survey data')
    return {
      records: await fetchMockSurveys(normalizedContainerNumber),
      source: 'mock',
      containerNumber: normalizedContainerNumber
    }
  }

  try {
    const query: Record<string, string> = {}
    if (normalizedContainerNumber) {
      query.containerNumber = normalizedContainerNumber
    }

    const response = await requestSurveyApi(apiUrl, query, apiKey, tlsInsecure)
    const records = normalizeRecords(response)

    if (records.length === 0) {
      apiLogger.warn(
        `Survey API returned 0 records (${apiUrl}${normalizedContainerNumber ? `?containerNumber=${normalizedContainerNumber}` : ''})`
      )
    }

    return {
      records,
      source: 'external',
      containerNumber: normalizedContainerNumber
    }
  } catch (error: unknown) {
    const fetchError = error as SurveyHttpError

    const statusCode = fetchError.statusCode
    const upstreamMessage = fetchError.message || 'Unknown error'

    if (statusCode === 401) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Survey API authentication failed — check SURVEY_API_KEY matches SurveyApi:ApiKey',
        data: { error: upstreamMessage, containerNumber: normalizedContainerNumber }
      })
    }

    if (statusCode === 503) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Survey API is not configured on the survey system',
        data: { error: upstreamMessage, containerNumber: normalizedContainerNumber }
      })
    }

    throw createError({
      statusCode: 502,
      statusMessage: normalizedContainerNumber
        ? `Failed to fetch surveys for ${normalizedContainerNumber}`
        : 'Failed to fetch surveys from external system',
      data: { error: upstreamMessage, containerNumber: normalizedContainerNumber }
    })
  }
}
