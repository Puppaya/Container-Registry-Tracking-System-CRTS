import type { MasterDataCategory, MasterDataOptionsMap } from '~/utils/master-data'
import {
  CATEGORY_OPTIONS,
  ISO_TYPE_OPTIONS,
  MANUFACTURER_OPTIONS,
  SIZE_OPTIONS
} from '~/utils/container-registration'

const FALLBACK_OPTIONS: MasterDataOptionsMap = {
  IsoType: ISO_TYPE_OPTIONS,
  ContainerSize: SIZE_OPTIONS,
  ContainerCategory: CATEGORY_OPTIONS,
  Manufacturer: MANUFACTURER_OPTIONS,
  Owner: [
    { label: 'Mediterranean Shipping Company (MSC)', value: 'MSC' },
    { label: 'Hapag-Lloyd', value: 'Hapag-Lloyd' },
    { label: 'Maersk Line', value: 'Maersk' },
    { label: 'CMA CGM', value: 'CMA CGM' }
  ],
  Location: [
    { label: 'Port of Rotterdam (NLRTM)', value: 'NLRTM' },
    { label: 'Vientiane Dry Port (LAVTE)', value: 'LAVTE' },
    { label: 'Bangkok Port (THBKK)', value: 'THBKK' }
  ],
  DocumentType: []
}

export function useMasterDataOptions() {
  const { data, pending, refresh } = useApi<{ data: MasterDataOptionsMap }>(() => '/api/master-data/options')

  const options = computed<MasterDataOptionsMap>(() => data.value?.data ?? {})

  function getOptions(category: MasterDataCategory, fallback = FALLBACK_OPTIONS[category] ?? []) {
    const items = options.value[category]
    return items?.length ? items : fallback
  }

  return {
    options,
    pending,
    refresh,
    getOptions
  }
}
