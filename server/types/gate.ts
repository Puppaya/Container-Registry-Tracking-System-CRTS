export interface ExternalGateRecord {
  gateReferenceNo: string
  containerNumber: string
  eventType: 'GateIn' | 'GateOut'
  eventDate: string | Date
  location: string
  vehiclePlateNo: string
  gateName?: string | null
  laneNo?: string | null
  facilityName?: string | null
  driverName?: string | null
  driverId?: string | null
  transportCompany?: string | null
  sealNo?: string | null
  bookingNo?: string | null
  remarks?: string | null
}

export interface GateSyncResultItem {
  gateReferenceNo: string
  containerNumber: string
  status: 'created' | 'skipped' | 'failed'
  reason?: string
}

export interface GateSyncSummary {
  total: number
  created: number
  skipped: number
  failed: number
  items: GateSyncResultItem[]
}
