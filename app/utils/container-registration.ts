import { z } from 'zod'
import {
  calculateCheckDigit,
  generateContainerNumber,
  normalizeContainerNumber,
  validateContainerNumber
} from '~/utils/container-validation'

export const CRTS_APP_VERSION = 'v2.4.0'

export const MAX_BIC_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024
export const BIC_DOCUMENT_ACCEPT = '.pdf,.png,.jpg,.jpeg'

export const REGISTRATION_STEPS = [
  { value: 'identification', title: 'Identification', icon: 'i-lucide-fingerprint' },
  { value: 'specifications', title: 'Specifications', icon: 'i-lucide-settings-2' },
  { value: 'ownership', title: 'Ownership', icon: 'i-lucide-building-2' },
  { value: 'registration', title: 'Registration', icon: 'i-lucide-clipboard-check' }
] as const

export type RegistrationStepValue = typeof REGISTRATION_STEPS[number]['value']

export const UNIT_STATUS_OPTIONS = [
  { label: 'New / Factory Fresh', value: 'New' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' }
]

export const ISO_TYPE_OPTIONS = [
  { label: '22G1 (General Purpose 20ft)', value: '22G1' },
  { label: '42G1 (General Purpose 40ft)', value: '42G1' },
  { label: '45G1 (High Cube 40ft)', value: '45G1' },
  { label: '22R1 (Reefer 20ft)', value: '22R1' },
  { label: '42R1 (Reefer 40ft)', value: '42R1' },
  { label: '22T1 (Tank 20ft)', value: '22T1' }
]

export const SIZE_OPTIONS = [
  { label: "20' ST", value: '20' },
  { label: "40' ST", value: '40' },
  { label: "45' HC", value: '45' }
]

export const CATEGORY_OPTIONS = [
  { label: 'Dry Freight', value: 'Dry' },
  { label: 'Reefer', value: 'Reefer' },
  { label: 'Tank', value: 'Tank' },
  { label: 'Open Top', value: 'Open Top' },
  { label: 'Flat Rack', value: 'Flat Rack' }
]

export const MANUFACTURER_OPTIONS = [
  { label: 'CIMC Group', value: 'CIMC Group' },
  { label: 'CXIC Group', value: 'CXIC Group' },
  { label: 'Dong Fang International', value: 'Dong Fang International' },
  { label: 'Maersk Container Industry', value: 'Maersk Container Industry' },
  { label: 'W&K Container', value: 'W&K Container' },
  { label: 'Other', value: 'Other' }
]

export const DRAFT_STORAGE_KEY = 'crts-container-registration-draft'

export interface ContainerRegistrationFormState {
  containerPrefix: string
  checkDigit: string
  unitStatus: string
  isoType: string
  containerSize: string
  containerCategory: string
  tareWeight: string
  maxPayload: string
  internalVolume: string
  owner: string
  leaseProvider: string
  manufacturer: string
  yearBuilt: string
  registryLocation: string
  cscExpiryDate: string
  registrationDate: string
  certified: boolean
}

export function createDefaultRegistrationState(): ContainerRegistrationFormState {
  return {
    containerPrefix: '',
    checkDigit: '',
    unitStatus: 'New',
    isoType: '42G1',
    containerSize: '40',
    containerCategory: 'Dry',
    tareWeight: '',
    maxPayload: '',
    internalVolume: '',
    owner: '',
    leaseProvider: '',
    manufacturer: '',
    yearBuilt: '',
    registryLocation: '',
    cscExpiryDate: '',
    registrationDate: new Date().toISOString().slice(0, 10),
    certified: false
  }
}

export function formatContainerPrefixInput(value: string): string {
  const normalized = normalizeContainerNumber(value)
  const letters = normalized.replace(/[^A-Z]/g, '').slice(0, 4)
  const digits = normalized.replace(/[^0-9]/g, '').slice(0, 6)
  return letters + digits
}

export function resolveFullContainerNumber(prefix: string, checkDigit: string): string {
  const normalizedPrefix = formatContainerPrefixInput(prefix)

  if (normalizedPrefix.length === 10 && /^\d$/.test(checkDigit)) {
    return `${normalizedPrefix}${checkDigit}`
  }

  if (normalizedPrefix.length === 10) {
    return generateContainerNumber(normalizedPrefix)
  }

  return normalizeContainerNumber(`${normalizedPrefix}${checkDigit}`)
}

export function validateContainerPrefixAndDigit(
  prefix: string,
  checkDigit: string
): { valid: boolean, normalized: string, error?: string } {
  const fullNumber = resolveFullContainerNumber(prefix, checkDigit)
  return validateContainerNumber(fullNumber)
}

export function autoFillCheckDigit(prefix: string): string | null {
  const normalized = formatContainerPrefixInput(prefix)
  if (normalized.length !== 10) return null

  try {
    return String(calculateCheckDigit(normalized))
  } catch {
    return null
  }
}

export function validateBicDocument(file: File): { valid: true } | { valid: false, error: string } {
  if (file.size <= 0) {
    return { valid: false, error: 'File is empty' }
  }

  if (file.size > MAX_BIC_DOCUMENT_SIZE_BYTES) {
    return { valid: false, error: 'File exceeds maximum size of 10MB' }
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !['pdf', 'png', 'jpg', 'jpeg'].includes(extension)) {
    return { valid: false, error: 'Only PDF, JPEG, or PNG files are allowed' }
  }

  return { valid: true }
}

export function stripNumericFormatting(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return ''
  return String(value).replace(/,/g, '')
}

export function formatIntegerInput(value: string | number | undefined | null): string {
  const digits = stripNumericFormatting(value).replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('en-US')
}

export function formatDecimalInput(value: string | number | undefined | null): string {
  const raw = stripNumericFormatting(value)
  if (!raw) return ''

  let cleaned = ''
  let hasDot = false

  for (const char of raw) {
    if (char >= '0' && char <= '9') {
      cleaned += char
      continue
    }

    if (char === '.' && !hasDot) {
      cleaned += '.'
      hasDot = true
    }
  }

  if (cleaned === '.') return '0.'

  const dotIndex = cleaned.indexOf('.')
  if (dotIndex === -1) return formatIntegerInput(cleaned)

  const intPart = cleaned.slice(0, dotIndex)
  const decPart = cleaned.slice(dotIndex + 1).slice(0, 3)
  const formattedInt = intPart ? Number(intPart).toLocaleString('en-US') : '0'

  return `${formattedInt}.${decPart}`
}

const optionalNumericField = z.union([z.string(), z.number()]).optional().or(z.literal(''))

export const REGISTRATION_FIELD_STEPS: Record<string, RegistrationStepValue> = {
  containerPrefix: 'identification',
  checkDigit: 'identification',
  unitStatus: 'identification',
  isoType: 'specifications',
  containerSize: 'specifications',
  containerCategory: 'specifications',
  tareWeight: 'specifications',
  maxPayload: 'specifications',
  internalVolume: 'specifications',
  owner: 'ownership',
  leaseProvider: 'ownership',
  manufacturer: 'ownership',
  yearBuilt: 'ownership',
  registryLocation: 'registration',
  cscExpiryDate: 'registration',
  registrationDate: 'registration',
  certified: 'registration'
}

export function getRegistrationStepForField(field: string): RegistrationStepValue {
  return REGISTRATION_FIELD_STEPS[field] ?? 'identification'
}

export function createContainerRegistrationSchema(
  t: (key: string, params?: Record<string, unknown>) => string
) {
  return z.object({
    containerPrefix: z.string().min(10, t('containers.form.validation.prefixRequired')),
    checkDigit: z.string().regex(/^\d$/, t('containers.form.validation.checkDigitRequired')),
    unitStatus: z.string().min(1),
    isoType: z.string().min(1, t('containers.form.validation.isoTypeRequired')),
    containerSize: z.string().min(1, t('containers.form.validation.sizeRequired')),
    containerCategory: z.string().min(1, t('containers.form.validation.categoryRequired')),
    tareWeight: optionalNumericField,
    maxPayload: optionalNumericField,
    internalVolume: optionalNumericField,
    owner: z.string().min(1, t('containers.form.validation.ownerRequired')),
    leaseProvider: z.string().optional().or(z.literal('')),
    manufacturer: z.string().optional().or(z.literal('')),
    yearBuilt: optionalNumericField,
    registryLocation: z.string().optional().or(z.literal('')),
    cscExpiryDate: z.string().optional().or(z.literal('')),
    registrationDate: z.string().min(1, t('containers.form.validation.registrationDateRequired')),
    certified: z.boolean().refine(value => value === true, { message: t('containers.form.validation.certificationRequired') })
  }).superRefine((data, ctx) => {
    const result = validateContainerPrefixAndDigit(data.containerPrefix, data.checkDigit)
    if (!result.valid) {
      ctx.addIssue({
        code: 'custom',
        path: ['containerPrefix'],
        message: result.error || t('containers.form.validation.invalidContainerNumber')
      })
    }

    if (data.yearBuilt && data.yearBuilt !== '') {
      const year = Number(data.yearBuilt)
      if (Number.isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        ctx.addIssue({
          code: 'custom',
          path: ['yearBuilt'],
          message: t('containers.form.validation.yearBuiltRange', { year: String(new Date().getFullYear()) })
        })
      }
    }

    for (const [field, labelKey] of [
      ['tareWeight', 'containers.form.tareWeight'],
      ['maxPayload', 'containers.form.maxPayload'],
      ['internalVolume', 'containers.form.internalVolume']
    ] as const) {
      const raw = data[field]
      if (raw !== '' && raw != null) {
        const num = Number(stripNumericFormatting(raw))
        if (Number.isNaN(num) || num <= 0) {
          ctx.addIssue({
            code: 'custom',
            path: [field],
            message: t('containers.form.validation.positiveNumber', { label: t(labelKey) })
          })
        }
      }
    }
  })
}

export const containerRegistrationSchema = createContainerRegistrationSchema(
  (key: string) => {
    const messages: Record<string, string> = {
      'containers.form.validation.prefixRequired': 'Container number prefix is required (4 letters + 6 digits)',
      'containers.form.validation.checkDigitRequired': 'Check digit must be a single digit',
      'containers.form.validation.isoTypeRequired': 'ISO type is required',
      'containers.form.validation.sizeRequired': 'Size is required',
      'containers.form.validation.categoryRequired': 'Category is required',
      'containers.form.validation.ownerRequired': 'Legal owner is required',
      'containers.form.validation.registrationDateRequired': 'Registration date is required',
      'containers.form.validation.certificationRequired': 'Certification confirmation is required',
      'containers.form.validation.invalidContainerNumber': 'Invalid container number',
      'containers.form.validation.yearBuiltRange': 'Year built must be between 1900 and {year}',
      'containers.form.validation.positiveNumber': '{label} must be a positive number',
      'containers.form.tareWeight': 'Tare weight',
      'containers.form.maxPayload': 'Max payload',
      'containers.form.internalVolume': 'Internal volume'
    }
    return messages[key] ?? key
  }
)

export type ContainerRegistrationSchema = z.infer<ReturnType<typeof createContainerRegistrationSchema>>

export function containerToRegistrationState(container: {
  containerNumber: string
  isoType: string
  containerSize: string
  containerCategory: string
  owner: string
  manufacturer?: string | null
  yearBuilt?: number | null
  tareWeight?: number | string | null
  maxPayload?: number | string | null
  internalVolume?: number | string | null
  leaseProvider?: string | null
  registryLocation?: string | null
  cscExpiryDate?: string | null
  registrationDate: string
  status: 'Active' | 'Inactive' | 'Pending'
}): ContainerRegistrationFormState {
  const normalized = normalizeContainerNumber(container.containerNumber)
  const containerPrefix = normalized.slice(0, 10)
  const checkDigit = normalized.slice(10, 11)

  return {
    containerPrefix,
    checkDigit,
    unitStatus: container.status,
    isoType: container.isoType,
    containerSize: container.containerSize,
    containerCategory: container.containerCategory,
    tareWeight: container.tareWeight != null ? formatIntegerInput(String(container.tareWeight)) : '',
    maxPayload: container.maxPayload != null ? formatIntegerInput(String(container.maxPayload)) : '',
    internalVolume: container.internalVolume != null ? formatDecimalInput(String(container.internalVolume)) : '',
    owner: container.owner,
    leaseProvider: container.leaseProvider ?? '',
    manufacturer: container.manufacturer ?? '',
    yearBuilt: container.yearBuilt != null ? String(container.yearBuilt) : '',
    registryLocation: container.registryLocation ?? '',
    cscExpiryDate: container.cscExpiryDate?.slice(0, 10) ?? '',
    registrationDate: container.registrationDate.slice(0, 10),
    certified: true
  }
}

function parseOptionalNumber(value: string | number | undefined | null): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'number') return value > 0 ? value : undefined

  const normalized = stripNumericFormatting(value).trim()
  if (normalized === '') return undefined

  const num = Number(normalized)
  if (Number.isNaN(num) || num <= 0) return undefined
  return num
}

export interface CreateContainerPayload {
  containerNumber: string
  isoType: string
  containerSize: string
  containerCategory: string
  owner: string
  manufacturer?: string
  yearBuilt?: number
  tareWeight?: number
  maxPayload?: number
  internalVolume?: number
  leaseProvider?: string
  registryLocation?: string
  cscExpiryDate?: string
  registrationDate: string
  status: 'Active' | 'Inactive'
}

export function buildContainerPayload(
  form: ContainerRegistrationFormState | ContainerRegistrationSchema,
  containerValidated: boolean
): CreateContainerPayload {
  const containerNumber = resolveFullContainerNumber(form.containerPrefix, form.checkDigit)

  if (!containerValidated) {
    const result = validateContainerPrefixAndDigit(form.containerPrefix, form.checkDigit)
    if (!result.valid) {
      throw new Error(result.error || 'Container number validation failed')
    }
  }

  const status: 'Active' | 'Inactive' = form.unitStatus === 'Inactive' ? 'Inactive' : 'Active'

  return {
    containerNumber,
    isoType: form.isoType,
    containerSize: form.containerSize,
    containerCategory: form.containerCategory,
    owner: form.owner.trim(),
    manufacturer: form.manufacturer?.trim() || undefined,
    yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
    tareWeight: parseOptionalNumber(form.tareWeight),
    maxPayload: parseOptionalNumber(form.maxPayload),
    internalVolume: parseOptionalNumber(form.internalVolume),
    leaseProvider: form.leaseProvider?.trim() || undefined,
    registryLocation: form.registryLocation?.trim() || undefined,
    cscExpiryDate: form.cscExpiryDate || undefined,
    registrationDate: form.registrationDate,
    status
  }
}
