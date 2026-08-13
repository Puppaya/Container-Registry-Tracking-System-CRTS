import { randomBytes } from 'node:crypto'

export function generatePublicRegistrationReference(date = new Date()): string {
  const day = date.toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = randomBytes(3).toString('hex').toUpperCase()
  return `REG-${day}-${suffix}`
}
