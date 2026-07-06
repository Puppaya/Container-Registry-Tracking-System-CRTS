import { describe, it, expect, vi, beforeEach } from 'vitest'
import { masterDataService } from '../../../server/services/master-data.service'
import { masterDataRepository } from '../../../server/utils/repositories'

vi.mock('../../../server/utils/repositories', () => ({
  masterDataRepository: {
    findPaginated: vi.fn(),
    findByMasterDataId: vi.fn(),
    findActiveByCategory: vi.fn(),
    findAllActive: vi.fn(),
    create: vi.fn(),
    updateByMasterDataId: vi.fn(),
    deleteByMasterDataId: vi.fn()
  }
}))

vi.mock('../../../server/utils/audit-log', () => ({
  logAudit: vi.fn()
}))

describe('MasterDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOptions', () => {
    it('should map active records to label/value options for a category', async () => {
      ;(masterDataRepository.findActiveByCategory as any).mockResolvedValue([
        { code: '22G1', name: '22G1 (General Purpose 20ft)' }
      ] as any)

      const result = await masterDataService.getOptions('IsoType')

      expect(result).toEqual([
        { label: '22G1 (General Purpose 20ft)', value: '22G1' }
      ])
    })
  })

  describe('createMasterData', () => {
    it('should create a master data record', async () => {
      ;(masterDataRepository.create as any).mockResolvedValue({
        masterDataId: 1,
        category: 'Owner',
        code: 'MSC',
        name: 'MSC',
        description: null,
        sortOrder: 0,
        isActive: true,
        createdBy: 'admin',
        createdDate: new Date('2026-01-01'),
        updatedBy: null,
        updatedDate: new Date('2026-01-01')
      } as any)

      const result = await masterDataService.createMasterData({
        category: 'Owner',
        code: 'MSC',
        name: 'MSC'
      }, 'admin')

      expect(masterDataRepository.create).toHaveBeenCalled()
      expect(result.code).toBe('MSC')
    })
  })
})
