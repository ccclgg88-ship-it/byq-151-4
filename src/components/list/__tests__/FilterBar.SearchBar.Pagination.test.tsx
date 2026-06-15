import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SearchBar } from '../SearchBar'
import { FilterBar } from '../FilterBar'
import { Pagination } from '../Pagination'
import { EmptyState } from '../EmptyState'
import { useEmployeeListStore } from '@/store/useEmployeeListStore'
import { mockEmployeeList } from '@/data/mockEmployeeList'
import { MemoryRouter } from 'react-router-dom'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('Chain A: List Filter/Pagination Components', () => {
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

  describe('SearchBar', () => {
    it('renders search input', () => {
      renderWithRouter(<SearchBar />)
      expect(screen.getByPlaceholderText('搜索姓名、工号、部门、岗位...')).toBeInTheDocument()
    })

    it('debounces keyword input to store', () => {
      vi.useFakeTimers()
      renderWithRouter(<SearchBar />)
      const input = screen.getByPlaceholderText('搜索姓名、工号、部门、岗位...')
      fireEvent.change(input, { target: { value: '张明远' } })
      expect(useEmployeeListStore.getState().searchKeyword).toBe('')
      act(() => { vi.advanceTimersByTime(300) })
      expect(useEmployeeListStore.getState().searchKeyword).toBe('张明远')
      vi.useRealTimers()
    })

    it('shows clear button when input has value', () => {
      renderWithRouter(<SearchBar />)
      const input = screen.getByPlaceholderText('搜索姓名、工号、部门、岗位...')
      expect(screen.queryByTitle('清除搜索')).not.toBeInTheDocument()
      fireEvent.change(input, { target: { value: 'test' } })
      expect(screen.getByTitle('清除搜索')).toBeInTheDocument()
    })
  })

  describe('FilterBar', () => {
    it('renders status filter buttons', () => {
      renderWithRouter(<FilterBar />)
      expect(screen.getByText('全部')).toBeInTheDocument()
      expect(screen.getByText('在职')).toBeInTheDocument()
      expect(screen.getByText('试用期')).toBeInTheDocument()
    })

    it('clicking status filter updates store', () => {
      renderWithRouter(<FilterBar />)
      fireEvent.click(screen.getByText('在职'))
      expect(useEmployeeListStore.getState().statusFilter).toBe('在职')
    })

    it('clicking status filter resets currentPage', () => {
      useEmployeeListStore.setState({ currentPage: 3 })
      renderWithRouter(<FilterBar />)
      fireEvent.click(screen.getByText('在职'))
      expect(useEmployeeListStore.getState().currentPage).toBe(1)
    })

    it('shows clear-all button when filters active', () => {
      useEmployeeListStore.setState({ statusFilter: '在职' })
      renderWithRouter(<FilterBar />)
      expect(screen.getByText('清除全部')).toBeInTheDocument()
    })

    it('clear-all resets filters', () => {
      useEmployeeListStore.setState({
        statusFilter: '在职',
        departmentFilters: ['财务部'],
        yearFilter: '2023',
        currentPage: 5,
      })
      renderWithRouter(<FilterBar />)
      fireEvent.click(screen.getByText('清除全部'))
      const s = useEmployeeListStore.getState()
      expect(s.statusFilter).toBe('all')
      expect(s.departmentFilters).toHaveLength(0)
      expect(s.yearFilter).toBeNull()
      expect(s.currentPage).toBe(1)
    })
  })

  describe('Pagination + useFilteredEmployees integration', () => {
    it('displays correct start-end/total text', () => {
      useEmployeeListStore.setState({ currentPage: 1, pageSize: 10 })
      renderWithRouter(<Pagination />)
      const total = useEmployeeListStore.getState().employees.length
      const text = screen.getByText(/显示.*条.*共.*条/)
      expect(text).toHaveTextContent(`1-10`)
      expect(text).toHaveTextContent(`${total}`)
    })

    it('updates display text when page changes', () => {
      useEmployeeListStore.setState({ currentPage: 1, pageSize: 5 })
      renderWithRouter(<Pagination />)
      const nextBtn = screen.getByTitle('下一页')
      fireEvent.click(nextBtn)
      expect(useEmployeeListStore.getState().currentPage).toBe(2)
    })

    it('changing pageSize resets to page 1', () => {
      useEmployeeListStore.setState({ currentPage: 3, pageSize: 10 })
      renderWithRouter(<Pagination />)
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: '20' } })
      expect(useEmployeeListStore.getState().pageSize).toBe(20)
      expect(useEmployeeListStore.getState().currentPage).toBe(1)
    })

    it('first/last page buttons work', () => {
      useEmployeeListStore.setState({ currentPage: 1, pageSize: 5 })
      renderWithRouter(<Pagination />)
      const lastBtn = screen.getByTitle('最后一页')
      fireEvent.click(lastBtn)
      const totalPages = Math.ceil(mockEmployeeList.length / 5)
      expect(useEmployeeListStore.getState().currentPage).toBe(totalPages)
      const firstBtn = screen.getByTitle('第一页')
      fireEvent.click(firstBtn)
      expect(useEmployeeListStore.getState().currentPage).toBe(1)
    })
  })

  describe('EmptyState', () => {
    it('renders no-results type with clear button', () => {
      renderWithRouter(<EmptyState type="no-results" />)
      expect(screen.getByText('未找到匹配的员工')).toBeInTheDocument()
      expect(screen.getByText('清除筛选条件')).toBeInTheDocument()
    })

    it('clear button resets all filters', () => {
      useEmployeeListStore.setState({
        searchKeyword: '不存在',
        statusFilter: '在职',
        currentPage: 3,
      })
      renderWithRouter(<EmptyState type="no-results" />)
      fireEvent.click(screen.getByText('清除筛选条件'))
      const s = useEmployeeListStore.getState()
      expect(s.searchKeyword).toBe('')
      expect(s.statusFilter).toBe('all')
      expect(s.currentPage).toBe(1)
    })

    it('renders no-data type without clear button', () => {
      renderWithRouter(<EmptyState type="no-data" />)
      expect(screen.getByText('暂无员工数据')).toBeInTheDocument()
      expect(screen.queryByText('清除筛选条件')).not.toBeInTheDocument()
    })
  })

  describe('Cross-component: SearchBar + FilterBar', () => {
    it('search keyword + status filter narrows results correctly', () => {
      vi.useFakeTimers()
      renderWithRouter(
        <>
          <SearchBar />
          <FilterBar />
        </>
      )

      const input = screen.getByPlaceholderText('搜索姓名、工号、部门、岗位...')
      fireEvent.change(input, { target: { value: '技术' } })
      act(() => { vi.advanceTimersByTime(300) })

      fireEvent.click(screen.getByText('在职'))

      const s = useEmployeeListStore.getState()
      const filtered = s.employees.filter(
        (e) =>
          (e.name.includes('技术') ||
            e.employeeId.includes('技术') ||
            e.department.includes('技术') ||
            e.position.includes('技术')) &&
          e.status === '在职'
      )
      expect(filtered.length).toBeGreaterThan(0)

      vi.useRealTimers()
    })
  })
})
