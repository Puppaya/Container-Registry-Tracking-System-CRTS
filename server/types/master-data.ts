import type { MasterDataCategory } from '../utils/master-data'

export interface MasterDataResponse {
  masterDataId: number
  category: MasterDataCategory
  code: string
  name: string
  description: string | null
  sortOrder: number
  isActive: boolean
  createdBy: string
  createdDate: string
  updatedBy: string | null
  updatedDate: string
}

export interface MasterDataOption {
  label: string
  value: string
}

export type MasterDataOptionsMap = Record<string, MasterDataOption[]>
