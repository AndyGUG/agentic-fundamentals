import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskList } from '../components/TaskList'
import type { Task } from '../types'

const tasks: Task[] = [
  { id: 1, title: 'Alpha Task', description: 'First', status: 'TODO', dueDate: '2026-06-01', category: 'Work' },
  { id: 2, title: 'Beta Task', description: 'Second', status: 'IN_PROGRESS', dueDate: '2026-03-01', category: 'Personal' },
  { id: 3, title: 'Gamma Task', description: 'Third', status: 'DONE', dueDate: '2026-12-31', category: 'Work' },
]

const noop = vi.fn()

function renderList(overrides: Partial<Parameters<typeof TaskList>[0]> = {}) {
  render(
    <TaskList
      tasks={tasks}
      loading={false}
      onEdit={noop}
      onDelete={noop}
      onStatusChange={noop}
      {...overrides}
    />
  )
}

describe('TaskList – rendering', () => {
  it('shows loading message when loading=true', () => {
    render(<TaskList tasks={[]} loading={true} onEdit={noop} onDelete={noop} onStatusChange={noop} />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows empty state message when no tasks', () => {
    render(<TaskList tasks={[]} loading={false} onEdit={noop} onDelete={noop} onStatusChange={noop} />)
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument()
  })

  it('renders all tasks by default', () => {
    renderList()
    expect(screen.getByText(/Alpha Task/)).toBeInTheDocument()
    expect(screen.getByText(/Beta Task/)).toBeInTheDocument()
    expect(screen.getByText(/Gamma Task/)).toBeInTheDocument()
  })

  it('shows task count in heading', () => {
    renderList()
    expect(screen.getByText(/Tasks \(3\)/i)).toBeInTheDocument()
  })

  it('renders category filter options', () => {
    renderList()
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })
})

describe('TaskList – search', () => {
  it('filters tasks by title search term', async () => {
    renderList()
    await userEvent.type(screen.getByPlaceholderText(/search tasks/i), 'Alpha')
    expect(screen.getByText(/Alpha Task/)).toBeInTheDocument()
    expect(screen.queryByText(/Beta Task/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Gamma Task/)).not.toBeInTheDocument()
  })

  it('filters tasks by description search term', async () => {
    renderList()
    await userEvent.type(screen.getByPlaceholderText(/search tasks/i), 'Second')
    expect(screen.getByText(/Beta Task/)).toBeInTheDocument()
    expect(screen.queryByText(/Alpha Task/)).not.toBeInTheDocument()
  })

  it('shows no results for non-matching search', async () => {
    renderList()
    await userEvent.type(screen.getByPlaceholderText(/search tasks/i), 'zzznomatch')
    expect(screen.getByText(/Tasks \(0\)/i)).toBeInTheDocument()
  })
})

describe('TaskList – category filter', () => {
  it('filters to only Work tasks when Work selected', async () => {
    renderList()
    await userEvent.selectOptions(screen.getByRole('combobox', { name: '' }), 'Work')
    expect(screen.getByText(/Alpha Task/)).toBeInTheDocument()
    expect(screen.getByText(/Gamma Task/)).toBeInTheDocument()
    expect(screen.queryByText(/Beta Task/)).not.toBeInTheDocument()
  })
})

describe('TaskList – sorting', () => {
  it('sorts by due date ascending when "Due Date" selected', async () => {
    renderList()
    await userEvent.selectOptions(screen.getByLabelText(/sort by/i), 'dueDate')
    const titles = screen.getAllByRole('listitem').map(li => li.textContent)
    const betaIdx = titles.findIndex(t => t?.includes('Beta Task'))
    const alphaIdx = titles.findIndex(t => t?.includes('Alpha Task'))
    const gammaIdx = titles.findIndex(t => t?.includes('Gamma Task'))
    // Beta(03-01) < Alpha(06-01) < Gamma(12-31)
    expect(betaIdx).toBeLessThan(alphaIdx)
    expect(alphaIdx).toBeLessThan(gammaIdx)
  })

  it('sorts by status when "Status" selected', async () => {
    renderList()
    await userEvent.selectOptions(screen.getByLabelText(/sort by/i), 'status')
    const titles = screen.getAllByRole('listitem').map(li => li.textContent)
    const todoIdx = titles.findIndex(t => t?.includes('Alpha Task'))   // TODO
    const inProgIdx = titles.findIndex(t => t?.includes('Beta Task'))  // IN_PROGRESS
    const doneIdx = titles.findIndex(t => t?.includes('Gamma Task'))   // DONE
    expect(todoIdx).toBeLessThan(inProgIdx)
    expect(inProgIdx).toBeLessThan(doneIdx)
  })
})
