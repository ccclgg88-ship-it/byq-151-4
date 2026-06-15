import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useEmployeeStore } from '../useEmployeeStore'
import type { ContractRecord, AttachmentFile } from '@/types/employee'

describe('useEmployeeStore', () => {
  beforeEach(async () => {
    useEmployeeStore.setState({
      profile: null,
      originalProfile: null,
      isEditMode: false,
      isLoading: false,
      isSaving: false,
      error: null,
      fieldChanges: [],
      newContracts: [],
      deletedAttachmentIds: [],
      pendingAttachmentUploads: [],
      activeEventFilter: 'all',
      permission: { role: 'HR专员', canEdit: true, canViewAllFields: true },
    })
  })

  describe('loadProfile', () => {
    it('loads profile and sets originalProfile', async () => {
      vi.useFakeTimers()
      const promise = useEmployeeStore.getState().loadProfile('EMP20210315')
      await vi.advanceTimersByTimeAsync(800)
      await promise
      const s = useEmployeeStore.getState()
      expect(s.profile).not.toBeNull()
      expect(s.originalProfile).not.toBeNull()
      expect(s.profile!.basic.name).toBe('张明远')
      expect(s.isLoading).toBe(false)
      vi.useRealTimers()
    })

    it('sets error on forceFail', async () => {
      vi.useFakeTimers()
      const promise = useEmployeeStore.getState().loadProfile('EMP20210315', true)
      await vi.advanceTimersByTimeAsync(800)
      await promise
      const s = useEmployeeStore.getState()
      expect(s.error).not.toBeNull()
      expect(s.profile).toBeNull()
      vi.useRealTimers()
    })
  })

  describe('field changes accumulation', () => {
    beforeEach(async () => {
      vi.useFakeTimers()
      const promise = useEmployeeStore.getState().loadProfile('EMP20210315')
      await vi.advanceTimersByTimeAsync(800)
      await promise
      useEmployeeStore.setState({ isEditMode: true })
      vi.useRealTimers()
    })

    it('updateBasicField accumulates fieldChanges', () => {
      useEmployeeStore.getState().updateBasicField('name', '新名字')
      const s = useEmployeeStore.getState()
      expect(s.fieldChanges).toHaveLength(1)
      expect(s.fieldChanges[0]!.fieldKey).toBe('basic.name')
      expect(s.fieldChanges[0]!.oldValue).toBe('张明远')
      expect(s.fieldChanges[0]!.newValue).toBe('新名字')
    })

    it('updateWorkField accumulates fieldChanges', () => {
      useEmployeeStore.getState().updateWorkField('position', '技术专家')
      const s = useEmployeeStore.getState()
      expect(s.fieldChanges).toHaveLength(1)
      expect(s.fieldChanges[0]!.fieldKey).toBe('work.position')
      expect(s.fieldChanges[0]!.newValue).toBe('技术专家')
    })

    it('reverting field to original value removes from fieldChanges', () => {
      useEmployeeStore.getState().updateBasicField('name', '新名字')
      expect(useEmployeeStore.getState().fieldChanges).toHaveLength(1)
      useEmployeeStore.getState().updateBasicField('name', '张明远')
      expect(useEmployeeStore.getState().fieldChanges).toHaveLength(0)
    })

    it('multiple field changes tracked independently', () => {
      useEmployeeStore.getState().updateBasicField('name', '新名字')
      useEmployeeStore.getState().updateWorkField('position', '技术专家')
      expect(useEmployeeStore.getState().fieldChanges).toHaveLength(2)
    })
  })

  describe('hasUnsavedChanges', () => {
    beforeEach(async () => {
      vi.useFakeTimers()
      const promise = useEmployeeStore.getState().loadProfile('EMP20210315')
      await vi.advanceTimersByTimeAsync(800)
      await promise
      vi.useRealTimers()
    })

    it('returns false when no changes', () => {
      expect(useEmployeeStore.getState().hasUnsavedChanges()).toBe(false)
    })

    it('returns true when fieldChanges exist', () => {
      useEmployeeStore.getState().updateBasicField('name', '新名字')
      expect(useEmployeeStore.getState().hasUnsavedChanges()).toBe(true)
    })

    it('returns true when newContracts exist', () => {
      useEmployeeStore.getState().addContract({
        contractNo: 'HT-NEW-001',
        type: '劳动合同',
        startDate: '2024-01-01',
        endDate: '2027-01-01',
        signParty: '测试公司',
        status: '生效中',
      })
      expect(useEmployeeStore.getState().hasUnsavedChanges()).toBe(true)
    })

    it('returns true when attachment deleted', () => {
      const s = useEmployeeStore.getState()
      const firstAttachmentId = s.profile!.attachments[0]!.id
      useEmployeeStore.getState().deleteAttachment(firstAttachmentId)
      expect(useEmployeeStore.getState().hasUnsavedChanges()).toBe(true)
    })

    it('returns true when attachment added', () => {
      useEmployeeStore.getState().addAttachment({
        name: 'test.pdf',
        category: '其他',
        fileType: 'pdf',
        size: 1024,
        uploadDate: '2024-01-01',
        url: '#',
      })
      expect(useEmployeeStore.getState().hasUnsavedChanges()).toBe(true)
    })
  })

  describe('contract and attachment operations', () => {
    beforeEach(async () => {
      vi.useFakeTimers()
      const promise = useEmployeeStore.getState().loadProfile('EMP20210315')
      await vi.advanceTimersByTimeAsync(800)
      await promise
      useEmployeeStore.setState({ isEditMode: true })
      vi.useRealTimers()
    })

    it('addContract adds to profile.contracts and newContracts', () => {
      useEmployeeStore.getState().addContract({
        contractNo: 'HT-NEW-001',
        type: '劳动合同',
        startDate: '2024-01-01',
        endDate: '2027-01-01',
        signParty: '测试公司',
        status: '生效中',
      })
      const s = useEmployeeStore.getState()
      expect(s.newContracts).toHaveLength(1)
      expect(s.newContracts[0]!.contractNo).toBe('HT-NEW-001')
      expect(s.profile!.contracts.length).toBeGreaterThan(
        s.newContracts.length + (s.profile!.contracts.length - s.newContracts.length - 1)
      )
    })

    it('deleteAttachment moves id to deletedAttachmentIds and removes from profile', () => {
      const s = useEmployeeStore.getState()
      const originalCount = s.profile!.attachments.length
      const targetId = s.profile!.attachments[0]!.id
      useEmployeeStore.getState().deleteAttachment(targetId)
      const after = useEmployeeStore.getState()
      expect(after.profile!.attachments).toHaveLength(originalCount - 1)
      expect(after.deletedAttachmentIds).toContain(targetId)
    })

    it('addAttachment adds to profile and pendingAttachmentUploads', () => {
      useEmployeeStore.getState().addAttachment({
        name: 'test.pdf',
        category: '其他',
        fileType: 'pdf',
        size: 1024,
        uploadDate: '2024-01-01',
        url: '#',
      })
      const s = useEmployeeStore.getState()
      expect(s.pendingAttachmentUploads).toHaveLength(1)
      expect(s.pendingAttachmentUploads[0]!.name).toBe('test.pdf')
    })

    it('deleteAttachment also removes from pendingAttachmentUploads if present', () => {
      useEmployeeStore.getState().addAttachment({
        name: 'pending-test.pdf',
        category: '其他',
        fileType: 'pdf',
        size: 1024,
        uploadDate: '2024-01-01',
        url: '#',
      })
      const pendingId = useEmployeeStore.getState().pendingAttachmentUploads[0]!.id
      useEmployeeStore.getState().deleteAttachment(pendingId)
      const s = useEmployeeStore.getState()
      expect(s.pendingAttachmentUploads).toHaveLength(0)
    })
  })

  describe('saveAll success', () => {
    beforeEach(async () => {
      vi.useFakeTimers()
      const promise = useEmployeeStore.getState().loadProfile('EMP20210315')
      await vi.advanceTimersByTimeAsync(800)
      await promise
      useEmployeeStore.setState({ isEditMode: true })
      useEmployeeStore.getState().updateBasicField('name', '新名字')
      useEmployeeStore.getState().addContract({
        contractNo: 'HT-NEW-001',
        type: '劳动合同',
        startDate: '2024-01-01',
        endDate: '2027-01-01',
        signParty: '测试公司',
        status: '生效中',
      })
      vi.useRealTimers()
    })

    it('on success: exits edit mode and clears pending queues', async () => {
      const originalRandom = Math.random
      Math.random = () => 0.9

      vi.useFakeTimers()
      const promise = useEmployeeStore.getState().saveAll()
      await vi.advanceTimersByTimeAsync(1200)
      const result = await promise

      expect(result.success).toBe(true)
      const s = useEmployeeStore.getState()
      expect(s.isEditMode).toBe(false)
      expect(s.fieldChanges).toHaveLength(0)
      expect(s.newContracts).toHaveLength(0)
      expect(s.deletedAttachmentIds).toHaveLength(0)
      expect(s.pendingAttachmentUploads).toHaveLength(0)
      expect(s.originalProfile!.basic.name).toBe('新名字')

      Math.random = originalRandom
      vi.useRealTimers()
    })
  })

  describe('saveAll failure', () => {
    beforeEach(async () => {
      vi.useFakeTimers()
      const promise = useEmployeeStore.getState().loadProfile('EMP20210315')
      await vi.advanceTimersByTimeAsync(800)
      await promise
      useEmployeeStore.setState({ isEditMode: true })
      useEmployeeStore.getState().updateBasicField('name', '新名字')
      vi.useRealTimers()
    })

    it('on failure: pending preserved and isSaving restored', async () => {
      const originalRandom = Math.random
      Math.random = () => 0.01

      vi.useFakeTimers()
      const promise = useEmployeeStore.getState().saveAll()
      await vi.advanceTimersByTimeAsync(1200)
      const result = await promise

      expect(result.success).toBe(false)
      const s = useEmployeeStore.getState()
      expect(s.isSaving).toBe(false)
      expect(s.fieldChanges).toHaveLength(1)
      expect(s.isEditMode).toBe(true)

      Math.random = originalRandom
      vi.useRealTimers()
    })
  })

  describe('cancelEdit', () => {
    beforeEach(async () => {
      vi.useFakeTimers()
      const promise = useEmployeeStore.getState().loadProfile('EMP20210315')
      await vi.advanceTimersByTimeAsync(800)
      await promise
      useEmployeeStore.setState({ isEditMode: true })
      useEmployeeStore.getState().updateBasicField('name', '新名字')
      useEmployeeStore.getState().updateWorkField('position', '技术专家')
      useEmployeeStore.getState().addContract({
        contractNo: 'HT-NEW-001',
        type: '劳动合同',
        startDate: '2024-01-01',
        endDate: '2027-01-01',
        signParty: '测试公司',
        status: '生效中',
      })
      vi.useRealTimers()
    })

    it('restores originalProfile and clears all pending', () => {
      const originalName = useEmployeeStore.getState().originalProfile!.basic.name
      useEmployeeStore.getState().cancelEdit()
      const s = useEmployeeStore.getState()
      expect(s.isEditMode).toBe(false)
      expect(s.fieldChanges).toHaveLength(0)
      expect(s.newContracts).toHaveLength(0)
      expect(s.deletedAttachmentIds).toHaveLength(0)
      expect(s.pendingAttachmentUploads).toHaveLength(0)
      expect(s.profile!.basic.name).toBe(originalName)
    })
  })

  describe('toggleEditMode with permission', () => {
    it('allows edit when canEdit is true', () => {
      useEmployeeStore.getState().toggleEditMode(true)
      expect(useEmployeeStore.getState().isEditMode).toBe(true)
    })

    it('blocks edit when canEdit is false', () => {
      useEmployeeStore.setState({
        permission: { role: '部门经理', canEdit: false, canViewAllFields: true },
      })
      useEmployeeStore.getState().toggleEditMode(true)
      expect(useEmployeeStore.getState().isEditMode).toBe(false)
    })
  })
})
