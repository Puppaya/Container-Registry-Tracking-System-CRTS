export type CrtsRole = 'Administrator' | 'RegistryOfficer' | 'SurveyTeam' | 'Management'

export type ContainerStatus = 'Active' | 'Inactive' | 'Pending'

export type ContainerEventType =
  | 'Registration'
  | 'Survey'
  | 'Repair'
  | 'Maintenance'
  | 'Relocation'
  | 'GateIn'
  | 'GateOut'
  | 'StatusChange'

export interface Container {
  containerId: number
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
  status: ContainerStatus
  qrCode?: string | null
  createdBy: string
  createdDate: string
  updatedBy?: string | null
  updatedDate: string
}

export interface ContainerEvent {
  eventId: number
  containerId: number
  eventType: ContainerEventType
  eventDescription?: string | null
  eventDate: string
  createdBy: string
  createdDate: string
}

export interface ContainerSurvey {
  surveyId: number | string
  containerId: number
  surveyReferenceNo: string
  surveyDate: string
  inspector?: string | null
  result: string
  damageSummary?: string | null
  reportUrl?: string | null
  createdDate: string
  isMock?: boolean
}

export interface ContainerDocument {
  documentId: number
  containerId: number
  documentType: string
  fileName: string
  fileUrl: string
  publicUrl?: string | null
  uploadedBy: string
  uploadedDate: string
}

export interface ContainerCurrentStatus {
  operationalStatus: ContainerStatus
  currentLocation: string | null
  locationSource: 'movement' | 'registry' | 'unknown'
  lastMovementType: Extract<ContainerEventType, 'GateIn' | 'GateOut' | 'Relocation'> | null
  lastUpdated: string | null
}

export interface ContainerProfile {
  container: Container
  currentStatus: ContainerCurrentStatus
  latestSurvey: ContainerSurvey | null
  surveyDataSource?: 'database' | 'mock'
  recentMovements: ContainerEvent[]
  documents: ContainerDocument[]
  documentCount: number
  eventCount: number
}

export interface PublicContainerTrackResponse {
  container: {
    containerNumber: string
    isoType: string
    containerSize: string
    containerCategory: string
    owner: string
    manufacturer?: string | null
    yearBuilt?: number | null
    registrationDate: string
    status: string
    qrCode?: string | null
  }
  currentStatus: ContainerCurrentStatus
  latestSurvey: { surveyDate: string, result: string } | null
  recentMovements: Array<{
    eventType: string
    eventDate: string
    eventDescription?: string | null
  }>
  timeline: Array<{
    eventType: string
    eventDate: string
    eventDescription?: string | null
  }>
  registrationReference?: string | null
}

export interface DashboardSummary {
  totalContainers: number
  activeContainers: number
  inactiveContainers: number
  surveyedContainers: number
  notSurveyedContainers: number
  requiringAttention: number
  recentRegistrations: number
  statusBreakdown: Array<{ status: string, count: number }>
  registrationTrend: Array<{ label: string, count: number }>
}

export interface DashboardActivity {
  eventId: number
  containerId: number
  containerNumber: string
  eventType: ContainerEventType
  eventDescription?: string | null
  eventDate: string
  createdBy: string
}

export interface ReportTable {
  title: string
  headers: string[]
  rows: Array<Array<string | number | null>>
  generatedAt: string
}

export interface AnalyticsKpis {
  totalContainers: number
  activeContainers: number
  inactiveContainers: number
  surveyedContainers: number
  notSurveyedContainers: number
  requiringAttention: number
  recentRegistrations: number
  totalEvents: number
  totalMovements: number
  totalSurveys: number
}

export interface AnalyticsBreakdownItem {
  label: string
  count: number
}

export interface AnalyticsEventBreakdownItem {
  eventType: string
  count: number
}

export interface AnalyticsOverview {
  kpis: AnalyticsKpis
  statusBreakdown: AnalyticsBreakdownItem[]
  sizeBreakdown: AnalyticsBreakdownItem[]
  categoryBreakdown: AnalyticsBreakdownItem[]
  registrationTrend: AnalyticsBreakdownItem[]
  eventBreakdown: AnalyticsEventBreakdownItem[]
  surveyResults: AnalyticsBreakdownItem[]
  generatedAt: string
}

export interface AuditLog {
  auditLogId: number
  action: string
  actor: string
  entityType: string
  entityId: string | null
  details: Record<string, unknown> | null
  createdDate: string
}

export interface LifecycleEvent {
  eventId: number
  containerId: number
  containerNumber: string | null
  containerStatus?: string | null
  containerOwner?: string | null
  eventType: ContainerEventType
  eventDescription: string | null
  eventDate: string
  createdBy: string
  createdDate: string
}

export interface LifecycleSummary {
  totalEvents: number
  byEventType: Array<{ eventType: ContainerEventType | string, count: number }>
}

export interface MovementEvent {
  eventId: number
  containerId: number
  containerNumber: string | null
  containerStatus?: string | null
  containerOwner?: string | null
  eventType: Extract<ContainerEventType, 'Relocation' | 'GateIn' | 'GateOut'>
  eventDescription: string | null
  eventDate: string
  createdBy: string
  createdDate: string
}

export interface MovementSummary {
  totalMovements: number
  recentMovements: number
  gateInCount: number
  gateOutCount: number
  relocationCount: number
}

export interface MovementTrackResult {
  container: {
    containerId: number
    containerNumber: string
    isoType: string
    containerSize: string
    containerCategory: string
    owner: string
    status: string
  }
  latestMovement: MovementEvent | null
  recentMovements: MovementEvent[]
}

export interface SurveyInspectionRecord {
  surveyId: number | string
  containerId: number | null
  containerNumber: string
  containerOwner?: string | null
  containerStatus?: string | null
  surveyReferenceNo: string
  surveyDate: string
  inspector: string | null
  result: string
  damageSummary: string | null
  reportUrl: string | null
  createdDate: string
  isMock: boolean
}

export interface SurveyInspectionSummary {
  totalInspections: number
  passCount: number
  conditionalCount: number
  failCount: number
  recentInspections: number
  dataSource?: 'database' | 'mock'
}

export interface SurveyInspectionListResult {
  data: SurveyInspectionRecord[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    dataSource: 'database' | 'mock'
  }
}

export interface SurveySyncResultItem {
  surveyReferenceNo: string
  containerNumber: string
  status: 'created' | 'skipped' | 'failed'
  reason?: string
}

export interface SurveySyncSummary {
  total: number
  created: number
  skipped: number
  failed: number
  items: SurveySyncResultItem[]
  fetchSource?: 'external' | 'mock'
  containerNumber?: string
}
