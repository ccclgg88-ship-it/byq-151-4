import { describe, it, expect, beforeEach } from 'vitest'
import { useEmployeeListStore } from '../useEmployeeListStore'
import { mockEmployeeList } from '@/data/mockEmployeeList'

describe('useEmployeeListStore', () => {
  beforeEach(() => {
    useEmployeeListStore.setState({
      employees: mockEmployeeList,
      searchKeyword: '',
      statusFilter: 'all',
      departmentFilters: [],
      yearFilter: null,
      sortField: 'hireDate',
      sortOrder: 'desc',
      currentPage: 1,
      pageSize: 10,
      hasLoaded: true,
    })
  })

  describe('filter state resets currentPage to 1', () => {
    it('setSearchKeyword resets currentPage', () => {
      useEmployeeListStore.setState({ currentPage: 3 })
      useEmployeeListStore.getState().setSearchKeyword('张')
      expect(useEmployeeListStore.getState().currentPage).toBe(1)
      expect(useEmployeeListStore.getState().searchKeyword).toBe('张')
    })

    it('setStatusFilter resets currentPage', () => {
      useEmployeeListStore.setState({ currentPage: 2 })
      useEmployeeListStore.getState().setStatusFilter('在职')
      expect(useEmployeeListStore.getState().currentPage).toBe(1)
      expect(useEmployeeListStore.getState().statusFilter).toBe('在职')
    })

    it('toggleDepartmentFilter resets currentPage', () => {
      useEmployeeListStore.setState({ currentPage: 5 })
      useEmployeeListStore.getState().toggleDepartmentFilter('技术研发中心 / 平台研发部')
      expect(useEmployeeListStore.getState().currentPage).toBe(1)
      expect(useEmployeeListStore.getState().departmentFilters).toContain('技术研发中心 / 平台研发部')
    })

    it('setYearFilter resets currentPage', () => {
      useEmployeeListStore.setState({ currentPage: 4 })
      useEmployeeListStore.getState().setYearFilter('2023')
      expect(useEmployeeListStore.getState().currentPage).toBe(1)
      expect(useEmployeeListStore.getState().yearFilter).toBe('2023')
    })
  })

  describe('sortField / sortOrder interaction', () => {
    it('setting a new sortField resets sortOrder to desc', () => {
      useEmployeeListStore.setState({ sortField: 'hireDate', sortOrder: 'asc' })
      useEmployeeListStore.getState().setSortField('name')
      expect(useEmployeeListStore.getState().sortField).toBe('name')
      expect(useEmployeeListStore.getState().sortOrder).toBe('desc')
    })

    it('clicking same sortField toggles sortOrder', () => {
      useEmployeeListStore.setState({ sortField: 'name', sortOrder: 'desc' })
      useEmployeeListStore.getState().setSortField('name')
      expect(useEmployeeListStore.getState().sortOrder).toBe('asc')
      useEmployeeListStore.getState().setSortField('name')
      expect(useEmployeeListStore.getState().sortOrder).toBe('desc')
    })

    it('toggleSortOrder independently flips order', () => {
      useEmployeeListStore.setState({ sortOrder: 'asc' })
      useEmployeeListStore.getState().toggleSortOrder()
      expect(useEmployeeListStore.getState().sortOrder).toBe('desc')
    })
  })

  describe('department filter toggle logic', () => {
    it('adds department when not present', () => {
      useEmployeeListStore.getState().toggleDepartmentFilter('财务部')
      expect(useEmployeeListStore.getState().departmentFilters).toContain('财务部')
    })

    it('removes department when already present', () => {
      useEmployeeListStore.getState().toggleDepartmentFilter('财务部')
      useEmployeeListStore.getState().toggleDepartmentFilter('财务部')
      expect(useEmployeeListStore.getState().departmentFilters).not.toContain('财务部')
    })

    it('clearDepartmentFilters removes all', () => {
      useEmployeeListStore.getState().toggleDepartmentFilter('财务部')
      useEmployeeListStore.getState().toggleDepartmentFilter('公司管理层')
      useEmployeeListStore.getState().clearDepartmentFilters()
      expect(useEmployeeListStore.getState().departmentFilters).toHaveLength(0)
    })
  })

  describe('clearAllFilters', () => {
    it('resets all filter state and currentPage', () => {
      useEmployeeListStore.setState({
        searchKeyword: '张',
        statusFilter: '在职',
        departmentFilters: ['财务部'],
        yearFilter: '2023',
        currentPage: 5,
      })
      useEmployeeListStore.getState().clearAllFilters()
      const s = useEmployeeListStore.getState()
      expect(s.searchKeyword).toBe('')
      expect(s.statusFilter).toBe('all')
      expect(s.departmentFilters).toHaveLength(0)
      expect(s.yearFilter).toBeNull()
      expect(s.currentPage).toBe(1)
    })
  })

  describe('pageSize change resets currentPage', () => {
    it('setPageSize sets pageSize and resets currentPage to 1', () => {
      useEmployeeListStore.setState({ currentPage: 3, pageSize: 10 })
      useEmployeeListStore.getState().setPageSize(20)
      expect(useEmployeeListStore.getState().pageSize).toBe(20)
      expect(useEmployeeListStore.getState().currentPage).toBe(1)
    })
  })
})
