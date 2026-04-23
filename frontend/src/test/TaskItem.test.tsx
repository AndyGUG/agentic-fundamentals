import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskItem } from '../components/TaskItem'
import type { Task } from '../types'

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test description',
  status: 'TODO',
  dueDate: '2026-12-31',
  category: 'Work',
}

function renderItem(task: Task = mockTask) {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  const onStatusChange = vi.fn()
  render(<TaskItem task={task} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />)
  return { onEdit, onDelete, onStatusChange }
}

describe('TaskItem – rendering', () => {
  it('renders task title', () => {
    renderItem()
    expect(screen.getByText(/Test Task/)).toBeInTheDocument()
  })

  it('renders task description', () => {
    renderItem()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    renderItem()
    expect(screen.getByText(/Work/)).toBeInTheDocument()
  })

  it('renders formatted due date', () => {
    renderItem()
    expect(screen.getByText(/Dec 31, 2026/)).toBeInTheDocument()
  })

  it('renders task id in heading', () => {
    renderItem()
    expect(screen.getByText(/ID: 0001/)).toBeInTheDocument()
  })

  it('renders TODO status badge', () => {
    renderItem()
    // 'TODO' appears in both the status badge and the dropdown option
    const badgeElements = screen.getAllByText('TODO')
    expect(badgeElements.length).toBeGreaterThanOrEqual(1)
    const badge = badgeElements.find(el => el.classList.contains('status-badge'))
    expect(badge).toBeInTheDocument()
  })

  it('renders IN PROGRESS status badge', () => {
    renderItem({ ...mockTask, status: 'IN_PROGRESS' })
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument()
  })

  it('renders DONE status badge', () => {
    renderItem({ ...mockTask, status: 'DONE' })
    expect(screen.getByText('DONE')).toBeInTheDocument()
  })
})

describe('TaskItem – interactions', () => {
  it('calls onEdit with task when Edit button is clicked', async () => {
    const { onEdit } = renderItem()
    await userEvent.click(screen.getByTitle('Edit task'))
    expect(onEdit).toHaveBeenCalledWith(mockTask)
  })

  it('calls onDelete with task id when Delete button is clicked', async () => {
    const { onDelete } = renderItem()
    await userEvent.click(screen.getByTitle('Delete task'))
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('calls onStatusChange with id and new status when dropdown changes', async () => {
    const { onStatusChange } = renderItem()
    await userEvent.selectOptions(screen.getByTitle('Change task status'), 'DONE')
    expect(onStatusChange).toHaveBeenCalledWith(1, 'DONE')
  })

  it('status dropdown shows current task status as selected', () => {
    renderItem({ ...mockTask, status: 'IN_PROGRESS' })
    expect(screen.getByTitle('Change task status')).toHaveValue('IN_PROGRESS')
  })
})
