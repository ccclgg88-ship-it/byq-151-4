import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import EmployeeProfilePage from '@/pages/EmployeeProfilePage'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { ChangeListDrawer } from '@/components/common/ChangeListDrawer'
import { ActionBar } from '@/components/common/ActionBar'
import { mockEmployee } from '@/data/mockEmployee'

function renderPage(id = 'EMP20210315') {
  return render(
    <MemoryRouter initialEntries={[`/employee/${id}`]}>
      <Routes>
        <Route path="/employee/:id" element={<EmployeeProfilePage />} />
      </Routes>
    </MemoryRouter>
  )
}

function renderActionBar() {
  return render(
    <MemoryRouter>
      <ActionBar
        employeeId="EMP20210315"
        onEdit={() => useEmployeeStore.getState().toggleEditMode(true)}
        onSave={() => {}}
        onCancel={() => useEmployeeStore.getState().cancelEdit()}
      />
    </MemoryRouter>
  )
}

function setupProfile() {
  useEmployeeStore.setState({
    profile: JSON.parse(JSON.stringify(mockEmployee)),
    originalProfile: JSON.parse(JSON.stringify(mockEmployee)),
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
}

describe('Chain B: Employee Profile Edit/Save', () => {
  beforeEach(() => {
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

  describe('ActionBar', () => {
    it('shows edit button when not in edit mode', () => {
      setupProfile()
      renderActionBar()
      expect(screen.getByText('编辑')).toBeInTheDocument()
    })

    it('shows save and cancel buttons in edit mode', () => {
      setupProfile()
      useEmployeeStore.getState().toggleEditMode(true)
      renderActionBar()
      expect(screen.getByText(/保存/)).toBeInTheDocument()
      expect(screen.getByText('取消')).toBeInTheDocument()
    })

    it('shows total changes badge in edit mode with changes', () => {
      setupProfile()
      useEmployeeStore.getState().toggleEditMode(true)
      useEmployeeStore.getState().updateBasicField('name', '新名字')
      renderActionBar()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('save button is disabled when no changes', () => {
      setupProfile()
      useEmployeeStore.getState().toggleEditMode(true)
      renderActionBar()
      const saveBtn = screen.getByText(/保存/)
      expect(saveBtn.closest('button')).toBeDisabled()
    })
  })

  describe('ChangeListDrawer', () => {
    it('renders when open with changes', () => {
      render(
        <ChangeListDrawer
          open={true}
          fieldChanges={[{ fieldKey: 'basic.name', label: '姓名', oldValue: '张明远', newValue: '新名字' }]}
          newContracts={[]}
          deletedAttachmentIds={['A001']}
          pendingUploads={[]}
          isSaving={false}
          onClose={() => {}}
          onConfirm={() => {}}
        />
      )
      expect(screen.getByText('变更清单确认')).toBeInTheDocument()
      expect(screen.getByText(/字段修改（1）/)).toBeInTheDocument()
      expect(screen.getByText(/删除附件（1）/)).toBeInTheDocument()
    })

    it('shows four categories of changes with correct counts', () => {
      render(
        <ChangeListDrawer
          open={true}
          fieldChanges={[
            { fieldKey: 'basic.name', label: '姓名', oldValue: '张明远', newValue: '新名字' },
            { fieldKey: 'work.position', label: '岗位', oldValue: '高级前端工程师', newValue: '技术专家' },
          ]}
          newContracts={[{ id: 'C_NEW', contractNo: 'HT-NEW', type: '劳动合同' as const, startDate: '2024-01-01', endDate: '2027-01-01', signParty: '公司', status: '生效中' as const }]}
          deletedAttachmentIds={['A001', 'A002']}
          pendingUploads={[{ id: 'A_NEW', name: 'new.pdf', category: '其他' as const, fileType: 'pdf' as const, size: 1024, uploadDate: '2024-01-01', url: '#' }]}
          isSaving={false}
          onClose={() => {}}
          onConfirm={() => {}}
        />
      )
      expect(screen.getByText(/字段修改（2）/)).toBeInTheDocument()
      expect(screen.getByText(/新增合同（1）/)).toBeInTheDocument()
      expect(screen.getByText(/新增附件（1）/)).toBeInTheDocument()
      expect(screen.getByText(/删除附件（2）/)).toBeInTheDocument()
    })

    it('shows empty state when no changes', () => {
      render(
        <ChangeListDrawer
          open={true}
          fieldChanges={[]}
          newContracts={[]}
          deletedAttachmentIds={[]}
          pendingUploads={[]}
          isSaving={false}
          onClose={() => {}}
          onConfirm={() => {}}
        />
      )
      expect(screen.getByText('暂无待提交的变更')).toBeInTheDocument()
    })

    it('confirm button is disabled when no changes', () => {
      render(
        <ChangeListDrawer
          open={true}
          fieldChanges={[]}
          newContracts={[]}
          deletedAttachmentIds={[]}
          pendingUploads={[]}
          isSaving={false}
          onClose={() => {}}
          onConfirm={() => {}}
        />
      )
      expect(screen.getByText('确认保存').closest('button')).toBeDisabled()
    })

    it('shows saving state', () => {
      render(
        <ChangeListDrawer
          open={true}
          fieldChanges={[{ fieldKey: 'basic.name', label: '姓名', oldValue: '张明远', newValue: '新名字' }]}
          newContracts={[]}
          deletedAttachmentIds={[]}
          pendingUploads={[]}
          isSaving={true}
          onClose={() => {}}
          onConfirm={() => {}}
        />
      )
      expect(screen.getByText('保存中...')).toBeInTheDocument()
    })

    it('onConfirm callback is called when clicking confirm', () => {
      const onConfirm = vi.fn()
      render(
        <ChangeListDrawer
          open={true}
          fieldChanges={[{ fieldKey: 'basic.name', label: '姓名', oldValue: '张明远', newValue: '新名字' }]}
          newContracts={[]}
          deletedAttachmentIds={[]}
          pendingUploads={[]}
          isSaving={false}
          onClose={() => {}}
          onConfirm={onConfirm}
        />
      )
      fireEvent.click(screen.getByText('确认保存'))
      expect(onConfirm).toHaveBeenCalled()
    })
  })

  describe('EmployeeProfilePage integration', () => {
    it('shows loading state initially', () => {
      renderPage()
      expect(useEmployeeStore.getState().isLoading).toBe(true)
    })

    it('loads profile and displays name via store', async () => {
      vi.useFakeTimers()
      renderPage()
      await act(async () => { vi.advanceTimersByTimeAsync(800) })
      expect(useEmployeeStore.getState().profile).not.toBeNull()
      expect(useEmployeeStore.getState().profile!.basic.name).toBe('张明远')
      vi.useRealTimers()
    })

    it('entering edit mode and making changes updates fieldChanges', async () => {
      setupProfile()
      renderPage()
      act(() => { useEmployeeStore.setState({ isLoading: false }) })

      fireEvent.click(screen.getByText('编辑'))
      expect(useEmployeeStore.getState().isEditMode).toBe(true)

      useEmployeeStore.getState().updateBasicField('name', '新名字')
      useEmployeeStore.getState().updateWorkField('position', '技术专家')

      const s = useEmployeeStore.getState()
      expect(s.fieldChanges).toHaveLength(2)
      expect(s.hasUnsavedChanges()).toBe(true)
    })

    it('reverting a field removes it from fieldChanges', () => {
      setupProfile()
      renderPage()

      useEmployeeStore.getState().toggleEditMode(true)
      useEmployeeStore.getState().updateBasicField('name', '新名字')
      expect(useEmployeeStore.getState().fieldChanges).toHaveLength(1)

      useEmployeeStore.getState().updateBasicField('name', '张明远')
      expect(useEmployeeStore.getState().fieldChanges).toHaveLength(0)
    })

    it('addContract + deleteAttachment makes hasUnsavedChanges true', () => {
      setupProfile()
      renderPage()

      useEmployeeStore.getState().toggleEditMode(true)
      useEmployeeStore.getState().addContract({
        contractNo: 'HT-NEW-001',
        type: '劳动合同',
        startDate: '2024-01-01',
        endDate: '2027-01-01',
        signParty: '公司',
        status: '生效中',
      })

      const s = useEmployeeStore.getState()
      const attachmentId = s.profile!.attachments[0]!.id
      useEmployeeStore.getState().deleteAttachment(attachmentId)

      expect(useEmployeeStore.getState().hasUnsavedChanges()).toBe(true)
    })

    it('addAttachment creates pendingAttachmentUploads', () => {
      setupProfile()
      renderPage()

      useEmployeeStore.getState().toggleEditMode(true)
      useEmployeeStore.getState().addAttachment({
        name: 'test.pdf',
        category: '其他',
        fileType: 'pdf',
        size: 1024,
        uploadDate: '2024-01-01',
        url: '#',
      })

      expect(useEmployeeStore.getState().pendingAttachmentUploads).toHaveLength(1)
      expect(useEmployeeStore.getState().hasUnsavedChanges()).toBe(true)
    })

    it('cancelEdit restores originalProfile and clears pending', () => {
      setupProfile()
      renderPage()

      useEmployeeStore.getState().toggleEditMode(true)
      useEmployeeStore.getState().updateBasicField('name', '新名字')
      useEmployeeStore.getState().addContract({
        contractNo: 'HT-NEW-001',
        type: '劳动合同',
        startDate: '2024-01-01',
        endDate: '2027-01-01',
        signParty: '公司',
        status: '生效中',
      })

      useEmployeeStore.getState().cancelEdit()
      const s = useEmployeeStore.getState()
      expect(s.isEditMode).toBe(false)
      expect(s.fieldChanges).toHaveLength(0)
      expect(s.newContracts).toHaveLength(0)
      expect(s.deletedAttachmentIds).toHaveLength(0)
      expect(s.profile!.basic.name).toBe('张明远')
    })

    it('ActionBar badge count matches ChangeListDrawer totals', () => {
      setupProfile()

      useEmployeeStore.getState().toggleEditMode(true)
      useEmployeeStore.getState().updateBasicField('name', '新名字')
      useEmployeeStore.getState().addContract({
        contractNo: 'HT-NEW-001',
        type: '劳动合同',
        startDate: '2024-01-01',
        endDate: '2027-01-01',
        signParty: '公司',
        status: '生效中',
      })

      const s = useEmployeeStore.getState()
      const attachmentId = s.profile!.attachments[0]!.id
      useEmployeeStore.getState().deleteAttachment(attachmentId)

      const after = useEmployeeStore.getState()
      const actionBarTotal =
        after.fieldChanges.length +
        after.newContracts.length +
        after.deletedAttachmentIds.length

      const drawerTotal =
        after.fieldChanges.length +
        after.newContracts.length +
        after.deletedAttachmentIds.length +
        after.pendingAttachmentUploads.length

      expect(actionBarTotal).toBe(3)
      expect(drawerTotal).toBe(3)
    })

    it('saveAll success exits edit mode and clears pending', async () => {
      setupProfile()

      useEmployeeStore.getState().toggleEditMode(true)
      useEmployeeStore.getState().updateBasicField('name', '新名字')

      const originalRandom = Math.random
      Math.random = () => 0.9

      vi.useFakeTimers()
      const promise = useEmployeeStore.getState().saveAll()
      await act(async () => { vi.advanceTimersByTimeAsync(1200) })
      const result = await promise

      expect(result.success).toBe(true)
      const s = useEmployeeStore.getState()
      expect(s.isEditMode).toBe(false)
      expect(s.fieldChanges).toHaveLength(0)
      expect(s.newContracts).toHaveLength(0)
      expect(s.deletedAttachmentIds).toHaveLength(0)

      Math.random = originalRandom
      vi.useRealTimers()
    })

    it('saveAll failure preserves pending and restores isSaving', async () => {
      setupProfile()

      useEmployeeStore.getState().toggleEditMode(true)
      useEmployeeStore.getState().updateBasicField('name', '新名字')

      const originalRandom = Math.random
      Math.random = () => 0.01

      vi.useFakeTimers()
      const promise = useEmployeeStore.getState().saveAll()
      await act(async () => { vi.advanceTimersByTimeAsync(1200) })
      const result = await promise

      expect(result.success).toBe(false)
      const s = useEmployeeStore.getState()
      expect(s.isSaving).toBe(false)
      expect(s.fieldChanges).toHaveLength(1)
      expect(s.isEditMode).toBe(true)

      Math.random = originalRandom
      vi.useRealTimers()
    })

    it('clicking save on ActionBar opens ChangeListDrawer when changes exist', () => {
      setupProfile()
      useEmployeeStore.getState().toggleEditMode(true)
      useEmployeeStore.getState().updateBasicField('name', '新名字')
      renderPage()
      act(() => { useEmployeeStore.setState({ isLoading: false }) })

      const saveBtn = screen.getByRole('button', { name: /保存/ })
      fireEvent.click(saveBtn)

      expect(screen.getByText('变更清单确认')).toBeInTheDocument()
    })
  })
})
