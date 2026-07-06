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

export const MASTER_DATA_CATEGORY_LABELS: Record<MasterDataCategory, string> = {
  IsoType: 'ISO Type',
  ContainerSize: 'Container Size',
  ContainerCategory: 'Container Category',
  Owner: 'Owner / Carrier',
  Manufacturer: 'Manufacturer',
  Location: 'Location / Yard',
  DocumentType: 'Document Type'
}
