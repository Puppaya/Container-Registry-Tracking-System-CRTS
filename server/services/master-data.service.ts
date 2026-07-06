import { masterDataRepository } from '../utils/repositories'
import { logAudit } from '../utils/audit-log'
import type { MasterDataCategory } from '../utils/master-data'
import { MASTER_DATA_CATEGORIES } from '../utils/master-data'
import type {
  MasterDataOption,
  MasterDataOptionsMap,
  MasterDataResponse
} from '../types/master-data'
import type { MasterDataListQuery } from '../utils/validation'

function mapMasterData(record: {
  masterDataId: number
  category: string
  code: string
  name: string
  description: string | null
  sortOrder: number
  isActive: boolean
  createdBy: string
  createdDate: Date
  updatedBy: string | null
  updatedDate: Date
}): MasterDataResponse {
  return {
    masterDataId: record.masterDataId,
    category: record.category as MasterDataCategory,
    code: record.code,
    name: record.name,
    description: record.description,
    sortOrder: record.sortOrder,
    isActive: record.isActive,
    createdBy: record.createdBy,
    createdDate: record.createdDate.toISOString(),
    updatedBy: record.updatedBy,
    updatedDate: record.updatedDate.toISOString()
  }
}

export class MasterDataService {
  async getMasterDataList(params: MasterDataListQuery) {
    const { page, pageSize, search, category, isActive } = params
    const where: Record<string, unknown> = {}

    if (category) {
      where.category = category
    }

    if (isActive === 'true') {
      where.isActive = true
    } else if (isActive === 'false') {
      where.isActive = false
    }

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    const result = await masterDataRepository.findPaginated({
      page,
      pageSize,
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }]
    })

    return {
      ...result,
      data: result.data.map(mapMasterData)
    }
  }

  async getMasterDataById(masterDataId: number) {
    const record = await masterDataRepository.findByMasterDataId(masterDataId)
    return record ? mapMasterData(record) : null
  }

  async getOptions(category?: MasterDataCategory): Promise<MasterDataOptionsMap | MasterDataOption[]> {
    if (category) {
      const records = await masterDataRepository.findActiveByCategory(category)
      return records.map((record: { code: string, name: string }) => ({
        label: record.name,
        value: record.code
      }))
    }

    const records = await masterDataRepository.findAllActive()
    const grouped: MasterDataOptionsMap = {}

    for (const cat of MASTER_DATA_CATEGORIES) {
      grouped[cat] = []
    }

    for (const record of records as Array<{ category: string, code: string, name: string }>) {
      if (!grouped[record.category]) {
        grouped[record.category] = []
      }
      grouped[record.category]!.push({
        label: record.name,
        value: record.code
      })
    }

    return grouped
  }

  async createMasterData(
    data: {
      category: MasterDataCategory
      code: string
      name: string
      description?: string | null
      sortOrder?: number
      isActive?: boolean
    },
    actor: string
  ) {
    const record = await masterDataRepository.create({
      category: data.category,
      code: data.code.trim(),
      name: data.name.trim(),
      description: data.description?.trim() || null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
      createdBy: actor
    })

    await logAudit({
      action: 'master_data.create',
      actor,
      entityType: 'MasterData',
      entityId: record.masterDataId,
      details: { category: record.category, code: record.code }
    })

    return mapMasterData(record)
  }

  async updateMasterData(
    masterDataId: number,
    data: {
      code?: string
      name?: string
      description?: string | null
      sortOrder?: number
      isActive?: boolean
    },
    actor: string
  ) {
    const payload: Record<string, unknown> = { updatedBy: actor }

    if (data.code !== undefined) payload.code = data.code.trim()
    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.description !== undefined) payload.description = data.description?.trim() || null
    if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder
    if (data.isActive !== undefined) payload.isActive = data.isActive

    const record = await masterDataRepository.updateByMasterDataId(masterDataId, payload)

    await logAudit({
      action: 'master_data.update',
      actor,
      entityType: 'MasterData',
      entityId: masterDataId,
      details: payload
    })

    return mapMasterData(record)
  }

  async deleteMasterData(masterDataId: number, actor: string) {
    const existing = await masterDataRepository.findByMasterDataId(masterDataId)
    if (!existing) return null

    await masterDataRepository.deleteByMasterDataId(masterDataId)

    await logAudit({
      action: 'master_data.delete',
      actor,
      entityType: 'MasterData',
      entityId: masterDataId,
      details: { category: existing.category, code: existing.code }
    })

    return mapMasterData(existing)
  }
}

export const masterDataService = new MasterDataService()
