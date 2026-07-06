import { CalendarDate, CalendarDateTime } from '@internationalized/date'
import { format, isValid, parse } from 'date-fns'

export const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy'
export const DISPLAY_DATETIME_FORMAT = 'dd/MM/yyyy HH:mm'
export const API_DATE_FORMAT = 'yyyy-MM-dd'
export const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm"

export function parseDate(value?: string | Date | null): Date | null {
  if (value == null || value === '') return null
  if (value instanceof Date) return isValid(value) ? value : null

  const trimmed = value.trim()
  if (!trimmed) return null

  const displayParsed = parse(trimmed, DISPLAY_DATE_FORMAT, new Date())
  if (isValid(displayParsed)) return displayParsed

  const displayDateTimeParsed = parse(trimmed, DISPLAY_DATETIME_FORMAT, new Date())
  if (isValid(displayDateTimeParsed)) return displayDateTimeParsed

  const apiParsed = parse(trimmed, API_DATE_FORMAT, new Date())
  if (isValid(apiParsed)) return apiParsed

  const localParsed = parse(trimmed, DATETIME_LOCAL_FORMAT, new Date())
  if (isValid(localParsed)) return localParsed

  const isoParsed = new Date(trimmed)
  return isValid(isoParsed) ? isoParsed : null
}

export function formatDisplayDate(value?: string | Date | null, fallback = '—'): string {
  const date = parseDate(value)
  if (!date) return fallback
  return format(date, DISPLAY_DATE_FORMAT)
}

export function formatDisplayDateTime(value?: string | Date | null, fallback = '—'): string {
  const date = parseDate(value)
  if (!date) return fallback
  return format(date, DISPLAY_DATETIME_FORMAT)
}

export function toApiDateString(value?: string | Date | null): string {
  const date = parseDate(value)
  if (!date) return ''
  return format(date, API_DATE_FORMAT)
}

export function toDateTimeLocalValue(value?: string | Date | null): string {
  const date = parseDate(value)
  if (!date) return ''
  return format(date, DATETIME_LOCAL_FORMAT)
}

export function toApiDateTimeString(value?: string | Date | null): string {
  const date = parseDate(value)
  if (!date) return ''
  return date.toISOString()
}

export function toCalendarDateValue(value?: string | null): CalendarDate | undefined {
  const date = parseDate(value)
  if (!date) return undefined
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function fromCalendarDateValue(value?: CalendarDate | null): string {
  if (!value) return ''
  return format(
    new Date(value.year, value.month - 1, value.day),
    API_DATE_FORMAT
  )
}

export function toCalendarDateTimeValue(value?: string | null): CalendarDateTime | undefined {
  const date = parseDate(value)
  if (!date) return undefined
  return new CalendarDateTime(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  )
}

export function fromCalendarDateTimeValue(value?: CalendarDateTime | null): string {
  if (!value) return ''
  return format(
    new Date(value.year, value.month - 1, value.day, value.hour, value.minute),
    DATETIME_LOCAL_FORMAT
  )
}
