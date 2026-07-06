import { format, isValid, parse } from 'date-fns'

export const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy'

export function parseDate(value?: Date | string | null): Date | null {
  if (value == null || value === '') return null
  if (value instanceof Date) return isValid(value) ? value : null

  const trimmed = String(value).trim()
  if (!trimmed) return null

  const displayParsed = parse(trimmed, DISPLAY_DATE_FORMAT, new Date())
  if (isValid(displayParsed)) return displayParsed

  const isoParsed = new Date(trimmed)
  return isValid(isoParsed) ? isoParsed : null
}

export function formatDisplayDate(value?: Date | string | null): string {
  const date = parseDate(value)
  if (!date) return ''
  return format(date, DISPLAY_DATE_FORMAT)
}
