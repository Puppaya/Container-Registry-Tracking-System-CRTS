import { z } from 'zod'
import { H3Event } from 'h3'
import { ALL_ROLES } from './roles'

const roleEnum = z.enum(ALL_ROLES as [string, ...string[]])

export const UserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  role: roleEnum.default('SurveyTeam')
})

export const UserUpdateSchema = UserSchema.partial()

export const ContainerSchema = z.object({
  containerNumber: z.string().min(11).max(11),
  isoType: z.string().min(1),
  containerSize: z.string().min(1),
  containerCategory: z.string().min(1),
  owner: z.string().min(1),
  manufacturer: z.string().optional(),
  yearBuilt: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  tareWeight: z.coerce.number().positive().optional(),
  maxPayload: z.coerce.number().positive().optional(),
  internalVolume: z.coerce.number().positive().optional(),
  leaseProvider: z.string().optional(),
  registryLocation: z.string().optional(),
  cscExpiryDate: z.coerce.date().optional(),
  registrationDate: z.coerce.date(),
  status: z.enum(['Active', 'Inactive']).default('Active')
})

export const ContainerUpdateSchema = ContainerSchema.partial()

export const ContainerStatusSchema = z.object({
  status: z.enum(['Active', 'Inactive'])
})

export const ContainerEventSchema = z.object({
  eventType: z.enum([
    'Registration',
    'Survey',
    'Repair',
    'Maintenance',
    'Relocation',
    'GateIn',
    'GateOut',
    'StatusChange'
  ]),
  eventDescription: z.string().optional(),
  eventDate: z.coerce.date()
})

export const TimelineQuerySchema = z.object({
  eventType: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
})

export const LifecycleListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  eventType: z.string().optional(),
  containerId: z.coerce.number().int().positive().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
})

export const MovementListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  movementType: z.string().optional(),
  containerId: z.coerce.number().int().positive().optional(),
  owner: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
})

export const MovementTrackQuerySchema = z.object({
  q: z.string().min(1)
})

export const CreateMovementSchema = z.object({
  eventType: z.enum(['Relocation', 'GateIn', 'GateOut']),
  eventDescription: z.string().min(1),
  eventDate: z.coerce.date()
})

export const SurveyInspectionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  result: z.string().optional(),
  containerId: z.coerce.number().int().positive().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
})

export const SurveySyncSchema = z.object({
  containerId: z.coerce.number().int().positive().optional(),
  containerNumber: z.string().min(4).optional()
}).optional()

export const SurveyInboundRecordSchema = z.object({
  surveyReferenceNo: z.string().min(1).max(100),
  containerNumber: z.string().min(4).max(20),
  surveyDate: z.coerce.date(),
  result: z.string().min(1).max(50),
  inspector: z.string().max(100).nullish(),
  damageSummary: z.string().max(2000).nullish(),
  reportUrl: z.string().url().max(500).nullish()
})

export const SurveyInboundBodySchema = z.union([
  SurveyInboundRecordSchema,
  z.object({
    records: z.array(SurveyInboundRecordSchema).min(1).max(100)
  })
])

export type SurveyInboundRecord = z.infer<typeof SurveyInboundRecordSchema>
export type SurveyInboundBody = z.infer<typeof SurveyInboundBodySchema>

export const GateInboundRecordSchema = z.object({
  gateReferenceNo: z.string().trim().min(1).max(100),
  containerNumber: z.string().trim().min(4).max(20),
  eventType: z.enum(['GateIn', 'GateOut']),
  eventDate: z.coerce.date(),
  location: z.string().trim().min(1).max(500),
  vehiclePlateNo: z.string().trim().min(1).max(50),
  gateName: z.string().trim().max(100).nullish(),
  laneNo: z.string().trim().max(20).nullish(),
  facilityName: z.string().trim().max(200).nullish(),
  driverName: z.string().trim().max(100).nullish(),
  driverId: z.string().trim().max(50).nullish(),
  transportCompany: z.string().trim().max(200).nullish(),
  sealNo: z.string().trim().max(50).nullish(),
  bookingNo: z.string().trim().max(100).nullish(),
  remarks: z.string().trim().max(2000).nullish()
})

export const GateInboundBodySchema = z.union([
  GateInboundRecordSchema,
  z.object({
    records: z.array(GateInboundRecordSchema).min(1).max(100)
  })
])

export type GateInboundRecord = z.infer<typeof GateInboundRecordSchema>
export type GateInboundBody = z.infer<typeof GateInboundBodySchema>

export type CreateUserInput = z.infer<typeof UserSchema>
export type UpdateUserInput = z.infer<typeof UserUpdateSchema>
export const ContainerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  owner: z.string().optional(),
  isoType: z.string().optional(),
  containerCategory: z.string().optional(),
  containerSize: z.string().optional(),
  surveyStatus: z.enum(['all', 'surveyed', 'not_surveyed', 'pass', 'conditional']).optional(),
  registrationDateFrom: z.coerce.date().optional(),
  registrationDateTo: z.coerce.date().optional()
})

export const ContainerQuickSearchSchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(25).default(10)
})

export const ContainerQrLookupSchema = z.object({
  code: z.string().min(3)
})

export const ContainerDocumentTypeSchema = z.enum([
  'Registration',
  'Survey',
  'Repair',
  'Maintenance',
  'Certificate',
  'Other'
])

export const ContainerDocumentUploadSchema = z.object({
  documentType: ContainerDocumentTypeSchema
})

export const ReportQuerySchema = z.object({
  format: z.enum(['json', 'xlsx', 'pdf']).default('json'),
  status: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
})

export const AuditLogListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
})

export type ReportQueryInput = z.infer<typeof ReportQuerySchema>
export type AuditLogListQuery = z.infer<typeof AuditLogListQuerySchema>

export type ContainerListQuery = z.infer<typeof ContainerListQuerySchema>
export type CreateContainerInput = z.infer<typeof ContainerSchema>
export type UpdateContainerInput = z.infer<typeof ContainerUpdateSchema>
export type CreateContainerEventInput = z.infer<typeof ContainerEventSchema>
export type TimelineQuery = z.infer<typeof TimelineQuerySchema>
export type LifecycleListQuery = z.infer<typeof LifecycleListQuerySchema>
export type MovementListQuery = z.infer<typeof MovementListQuerySchema>
export type CreateMovementInput = z.infer<typeof CreateMovementSchema>
export type SurveyInspectionListQuery = z.infer<typeof SurveyInspectionListQuerySchema>

export const MasterDataCategorySchema = z.enum([
  'IsoType',
  'ContainerSize',
  'ContainerCategory',
  'Owner',
  'Manufacturer',
  'Location',
  'DocumentType'
])

export const MasterDataSchema = z.object({
  category: MasterDataCategorySchema,
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true)
})

export const MasterDataUpdateSchema = MasterDataSchema.partial().omit({ category: true })

export const MasterDataListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  category: MasterDataCategorySchema.optional(),
  search: z.string().optional(),
  isActive: z.enum(['all', 'true', 'false']).optional()
})

export const MasterDataOptionsQuerySchema = z.object({
  category: MasterDataCategorySchema.optional()
})

export type MasterDataListQuery = z.infer<typeof MasterDataListQuerySchema>
export type CreateMasterDataInput = z.infer<typeof MasterDataSchema>
export type UpdateMasterDataInput = z.infer<typeof MasterDataUpdateSchema>

/**
 * Validates request body against a Zod schema.
 * Throws 400 Bad Request if validation fails.
 */
export const validateBody = async <T extends z.ZodTypeAny>(event: H3Event, schema: T): Promise<z.infer<T>> => {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Failed',
      data: result.error.flatten()
    })
  }

  return result.data
}

/** Alias used by API handlers */
export const validateRequest = validateBody

/**
 * Validates request query against a Zod schema.
 */
export const validateQuery = <T extends z.ZodTypeAny>(event: H3Event, schema: T): z.infer<T> => {
  const query = getQuery(event)
  const result = schema.safeParse(query)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Query Parameters',
      data: result.error.flatten()
    })
  }

  return result.data
}
