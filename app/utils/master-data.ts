export const MASTER_DATA_CATEGORIES = [
  'IsoType',
  'ContainerSize',
  'ContainerCategory',
  'Owner',
  'Manufacturer',
  'Location',
  'DocumentType'
] as const

export type MasterDataCategory = typeof MASTER_DATA_CATEGORIES[number]

export const MASTER_DATA_CATEGORY_SLUGS: Record<MasterDataCategory, string> = {
  IsoType: 'iso-type',
  ContainerSize: 'container-size',
  ContainerCategory: 'container-category',
  Owner: 'owner',
  Manufacturer: 'manufacturer',
  Location: 'location',
  DocumentType: 'document-type'
}

export const MASTER_DATA_CATEGORY_ICONS: Record<MasterDataCategory, string> = {
  IsoType: 'i-lucide-box',
  ContainerSize: 'i-lucide-ruler',
  ContainerCategory: 'i-lucide-tags',
  Owner: 'i-lucide-building-2',
  Manufacturer: 'i-lucide-factory',
  Location: 'i-lucide-map-pin',
  DocumentType: 'i-lucide-file-type'
}

export function categoryToSlug(category: MasterDataCategory): string {
  return MASTER_DATA_CATEGORY_SLUGS[category]
}

export function slugToCategory(slug: string): MasterDataCategory | null {
  const entry = Object.entries(MASTER_DATA_CATEGORY_SLUGS).find(([, value]) => value === slug)
  return entry ? entry[0] as MasterDataCategory : null
}

export function getDefaultMasterDataCategory(): MasterDataCategory {
  return MASTER_DATA_CATEGORIES[0]
}

export interface MasterData {
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

export type MasterDataOptionsMap = Partial<Record<MasterDataCategory, MasterDataOption[]>>
