const LETTER_VALUES: Record<string, number> = {
  A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19,
  J: 20, K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29,
  S: 30, T: 31, U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38
}

const CONTAINER_NUMBER_PATTERN = /^[A-Z]{4}\d{7}$/
const PREFIX_PATTERN = /^[A-Z]{4}\d{6}$/

export interface ContainerNumberValidationResult {
  valid: boolean
  normalized: string
  error?: string
}

export function normalizeContainerNumber(value: string): string {
  return value.replace(/[\s-]/g, '').toUpperCase()
}

export function calculateCheckDigit(prefix10: string): number {
  const normalized = normalizeContainerNumber(prefix10)

  if (normalized.length !== 10) {
    throw new Error('Check digit prefix must be exactly 10 characters')
  }

  let sum = 0

  for (let i = 0; i < 10; i++) {
    const char = normalized.charAt(i)

    if (!char) {
      throw new Error('Invalid container number length')
    }

    let value: number

    if (/[A-Z]/.test(char)) {
      const letterValue = LETTER_VALUES[char]
      if (letterValue === undefined) {
        throw new Error(`Invalid letter in container number: ${char}`)
      }
      value = letterValue
    } else if (/\d/.test(char)) {
      value = Number(char)
    } else {
      throw new Error(`Invalid character in container number: ${char}`)
    }

    sum += value * Math.pow(2, i)
  }

  const remainder = sum % 11
  return remainder === 10 ? 0 : remainder
}

export function generateContainerNumber(prefix10: string): string {
  const normalized = normalizeContainerNumber(prefix10)

  if (!PREFIX_PATTERN.test(normalized)) {
    throw new Error('Prefix must be 4 letters followed by 6 digits')
  }

  const checkDigit = calculateCheckDigit(normalized)
  return `${normalized}${checkDigit}`
}

export function validateContainerNumber(value: string): ContainerNumberValidationResult {
  const normalized = normalizeContainerNumber(value)

  if (!normalized) {
    return { valid: false, normalized, error: 'ກະລຸນາປ້ອນເລກຕູຄອນເທນເນອກ' }
  }

  if (!CONTAINER_NUMBER_PATTERN.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'ຮູບແບບບໍ່ຖືກຕ້ອງ: 4 ຕົວອັກສອນ + 7 ຕົວເລກ (ISO 6346)'
    }
  }

  const prefix = normalized.slice(0, 10)
  const providedCheckDigit = Number(normalized[10])
  const expectedCheckDigit = calculateCheckDigit(prefix)

  if (providedCheckDigit !== expectedCheckDigit) {
    return {
      valid: false,
      normalized,
      error: `Check digit ບໍ່ຖືກຕ້ອງ — ຄວນເປັນ ${expectedCheckDigit} (ບໍ່ແມ່ນ ${providedCheckDigit})`
    }
  }

  return { valid: true, normalized }
}

export function resolveContainerNumberInput(value: string): string {
  const normalized = normalizeContainerNumber(value)

  if (PREFIX_PATTERN.test(normalized)) {
    return generateContainerNumber(normalized)
  }

  if (CONTAINER_NUMBER_PATTERN.test(normalized)) {
    const prefix = normalized.slice(0, 10)
    return generateContainerNumber(prefix)
  }

  return normalized
}
