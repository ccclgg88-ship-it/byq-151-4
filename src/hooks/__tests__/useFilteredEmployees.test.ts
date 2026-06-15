import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilteredEmployees, getRowIndex } from '../useFilteredEmployees'
import { useEmployeeListStore } from '@/store/useEmployeeListStore'
import { mockEmployeeList } from '@/data/mockEmployeeList'

describe('useFilteredEmployees', () => {
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
    })
  })

  describe('keyword search', () => {
    it('filters by name', () => {
      useEmployeeListStore.setState({ searchKeyword: '张明远' })
      const { result } = renderHook(() => useFilteredEmployees())
      expect(result.current.filtered.every((e) => e.name.includes('张明远'))).toBe(true)
    })

    it('filters by employeeId', () => {
      useEmployeeListStore.setState({ searchKeyword: 'EMP20210315' })
      const { result } = renderHook(() => useFilteredEmployees())
      expect(result.current.filtered.every((e) => e.employeeId.includes('EMP20210315'))).toBe(true)
    })

    it('filters by department', () => {
      useEmployeeListStore.setState({ searchKeyword: '财务部' })
      const { result } = renderHook(() => useFilteredEmployees())
      expect(result.current.filtered.length).toBeGreaterThan(0)
      expect(result.current.filtered.every((e) => e.department.includes('财务部'))).toBe(true)
    })

    it('filters by position', () => {
      useEmployeeListStore.setState({ searchKeyword: '前端' })
      const { result } = renderHook(() => useFilteredEmployees())
      expect(result.current.filtered.every((e) => e.position.includes('前端'))).toBe(true)
    })

    it('is case-insensitive', () => {
      useEmployeeListStore.setState({ searchKeyword: 'emp2021' })
      const { result } = renderHook(() => useFilteredEmployees())
      expect(result.current.filtered.length).toBeGreaterThan(0)
    })
  })

  describe('combined filters', () => {
    it('statusFilter + keyword narrows results', () => {
      useEmployeeListStore.setState({ searchKeyword: '技术', statusFilter: '在职' })
      const { result } = renderHook(() => useFilteredEmployees())
      result.current.filtered.forEach((e) => {
        expect(e.status).toBe('在职')
        expect(
          e.name.includes('技术') ||
          e.employeeId.includes('技术') ||
          e.department.includes('技术') ||
          e.position.includes('技术')
        ).toBe(true)
      })
    })

    it('departmentFilters + yearFilter combination', () => {
      useEmployeeListStore.setState({
        departmentFilters: ['技术研发中心 / 平台研发部'],
        yearFilter: '2021',
      })
      const { result } = renderHook(() => useFilteredEmployees())
      result.current.filtered.forEach((e) => {
        expect(e.department).toBe('技术研发中心 / 平台研发部')
        expect(e.hireDate.startsWith('2021')).toBe(true)
      })
    })

    it('all three filters together', () => {
      useEmployeeListStore.setState({
        statusFilter: '在职',
        departmentFilters: ['技术研发中心 / 平台研发部'],
        yearFilter: '2021',
      })
      const { result } = renderHook(() => useFilteredEmployees())
      result.current.filtered.forEach((e) => {
        expect(e.status).toBe('在职')
        expect(e.department).toBe('技术研发中心 / 平台研发部')
        expect(e.hireDate.startsWith('2021')).toBe(true)
      })
    })
  })

  describe('sorting', () => {
    it('sorts by hireDate desc by default', () => {
      const { result } = renderHook(() => useFilteredEmployees())
      const dates = result.current.filtered.map((e) => e.hireDate)
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]! <= dates[i - 1]!).toBe(true)
      }
    })

    it('sorts by name asc with Chinese localeCompare', () => {
      useEmployeeListStore.setState({ sortField: 'name', sortOrder: 'asc' })
      const { result } = renderHook(() => useFilteredEmployees())
      const names = result.current.filtered.map((e) => e.name)
      for (let i = 1; i < names.length; i++) {
        expect(names[i]!.localeCompare(names[i - 1]!, 'zh-CN')).toBeGreaterThanOrEqual(0)
      }
    })

    it('sorts by department desc', () => {
      useEmployeeListStore.setState({ sortField: 'department', sortOrder: 'desc' })
      const { result } = renderHook(() => useFilteredEmployees())
      const depts = result.current.filtered.map((e) => e.department)
      for (let i = 1; i < depts.length; i++) {
        expect(depts[i - 1]!.localeCompare(depts[i]!, 'zh-CN')).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('pagination', () => {
    it('paginated returns correct slice for page 1', () => {
      useEmployeeListStore.setState({ currentPage: 1, pageSize: 5 })
      const { result } = renderHook(() => useFilteredEmployees())
      expect(result.current.paginated).toHaveLength(5)
    })

    it('paginated returns correct slice for page 2', () => {
      useEmployeeListStore.setState({ currentPage: 2, pageSize: 5 })
      const { result } = renderHook(() => useFilteredEmployees())
      const allFiltered = result.current.filtered
      expect(result.current.paginated).toEqual(allFiltered.slice(5, 10))
    })

    it('totalPages is correct', () => {
      useEmployeeListStore.setState({ pageSize: 10 })
      const { result } = renderHook(() => useFilteredEmployees())
      const expected = Math.ceil(result.current.totalCount / 10)
      expect(result.current.totalPages).toBe(expected)
    })

    it('totalPages is 1 when filtered is empty', () => {
      useEmployeeListStore.setState({ searchKeyword: '不存在的名字xyz' })
      const { result } = renderHook(() => useFilteredEmployees())
      expect(result.current.filtered).toHaveLength(0)
      expect(result.current.totalPages).toBe(1)
    })

    it('totalCount matches filtered length', () => {
      useEmployeeListStore.setState({ statusFilter: '试用期' })
      const { result } = renderHook(() => useFilteredEmployees())
      expect(result.current.totalCount).toBe(result.current.filtered.length)
    })
  })

  describe('getRowIndex', () => {
    it('returns correct index', () => {
      const item = mockEmployeeList[2]!
      const idx = getRowIndex(item, mockEmployeeList, 1, 10)
      expect(idx).toBe(3)
    })

    it('respects currentPage offset', () => {
      const item = mockEmployeeList[0]!
      const idx = getRowIndex(item, mockEmployeeList, 2, 10)
      expect(idx).toBe(11)
    })
  })
})
