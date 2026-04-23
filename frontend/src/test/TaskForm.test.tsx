import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '../components/TaskForm'
import type { Task } from '../types'

const mockTask: Task = {
  id: 42,
  title: 'Existing Task',
  description: 'Existing description',
  status: 'IN_PROGRESS',
  dueDate: '2026-12-31',
  category: 'Work',
}

beforeEach(() => localStorage.removeItem('categoryHistory'))
afterEach(() => localStorage.removeItem('categoryHistory'))

function renderForm(editingTask: Task | null = null) {
  const onSuccess = vi.fn()
  const onCancel = vi.fn()
  render(<TaskForm editingTask={editingTask} onSuccess={onSuccess} onCancel={onCancel} />)
  return { onSuccess, onCancel }
}

// jsdom enforces HTML5 required validation which prevents the submit event from
// reaching React's onSubmit handler when required fields are empty. Using
// fireEvent.submit bypasses constraint validation and fires the React handler.
function submitViaForm() {
  fireEvent.submit(document.querySelector('form')!)
}

// ─── CREATE MODE ────────────────────────────────────────────────────────────

describe('TaskForm – create mode', () => {
  it('renders "Add New Task" heading', () => {
    renderForm()
    expect(screen.getByText('Add New Task')).toBeInTheDocument()
  })

  it('shows validation error when title is empty on submit', async () => {
    renderForm()
    submitViaForm()
    await waitFor(() => expect(screen.getByText('Title is required')).toBeInTheDocument())
  })

  it('shows validation error when description is empty', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/task title/i), 'Some title')
    submitViaForm()
    await waitFor(() => expect(screen.getByText('Description is required')).toBeInTheDocument())
  })

  it('shows validation error when category is empty', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/task title/i), 'Title')
    await userEvent.type(screen.getByLabelText(/description/i), 'Desc')
    submitViaForm()
    await waitFor(() => expect(screen.getByText('Category is required')).toBeInTheDocument())
  })

  it('shows validation error when due date is empty', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/task title/i), 'Title')
    await userEvent.type(screen.getByLabelText(/description/i), 'Desc')
    await userEvent.type(screen.getByLabelText(/category/i), 'Work')
    submitViaForm()
    await waitFor(() => expect(screen.getByText('Due date is required')).toBeInTheDocument())
  })

  it('calls onSuccess with correct data on valid submission', async () => {
    const { onSuccess } = renderForm()
    await userEvent.type(screen.getByLabelText(/task title/i), 'My Task')
    await userEvent.type(screen.getByLabelText(/description/i), 'My description')
    await userEvent.type(screen.getByLabelText(/category/i), 'Work')
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-12-31' } })

    await userEvent.click(screen.getByRole('button', { name: /add task/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'My Task', description: 'My description', category: 'Work' }),
        false
      )
    })
  })

  it('resets form fields after successful submission', async () => {
    renderForm()
    const titleInput = screen.getByLabelText(/task title/i)
    await userEvent.type(titleInput, 'Temp Title')
    await userEvent.type(screen.getByLabelText(/description/i), 'Desc')
    await userEvent.type(screen.getByLabelText(/category/i), 'Work')
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-12-31' } })

    await userEvent.click(screen.getByRole('button', { name: /add task/i }))

    await waitFor(() => {
      expect(titleInput).toHaveValue('')
    })
  })
})

// ─── EDIT MODE ───────────────────────────────────────────────────────────────

describe('TaskForm – edit mode', () => {
  it('renders "Edit Task" heading', () => {
    renderForm(mockTask)
    expect(screen.getByText('Edit Task')).toBeInTheDocument()
  })

  it('pre-fills title, description, category from editingTask', () => {
    renderForm(mockTask)
    expect(screen.getByLabelText(/task title/i)).toHaveValue('Existing Task')
    expect(screen.getByLabelText(/description/i)).toHaveValue('Existing description')
    expect(screen.getByLabelText(/category/i)).toHaveValue('Work')
  })

  it('shows "Update Task" button', () => {
    renderForm(mockTask)
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument()
  })

  it('calls onSuccess with isUpdate=true on submit', async () => {
    const { onSuccess } = renderForm(mockTask)
    await userEvent.click(screen.getByRole('button', { name: /update task/i }))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ id: 42 }), true)
    })
  })

  it('calls onCancel when Cancel Edit is clicked', async () => {
    const { onCancel } = renderForm(mockTask)
    await userEvent.click(screen.getByRole('button', { name: /cancel edit/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows read-only ID field in edit mode', () => {
    renderForm(mockTask)
    const idField = screen.getByLabelText(/^ID$/i)
    expect(idField).toBeDisabled()
    expect(idField).toHaveValue('0042')
  })
})

// ─── NEW VALIDATION RULES ────────────────────────────────────────────────────

describe('TaskForm – date and character-set validation', () => {
  it('shows error when due date is in the past', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/task title/i), 'Title')
    await userEvent.type(screen.getByLabelText(/description/i), 'Desc')
    await userEvent.type(screen.getByLabelText(/category/i), 'Work')
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2020-01-01' } })
    submitViaForm()
    await waitFor(() =>
      expect(screen.getByText('Due date must be today or in the future')).toBeInTheDocument()
    )
  })

  it('accepts a due date set to today', async () => {
    const { onSuccess } = renderForm()
    const today = new Date().toISOString().split('T')[0]
    await userEvent.type(screen.getByLabelText(/task title/i), 'Today Task')
    await userEvent.type(screen.getByLabelText(/description/i), 'Desc')
    await userEvent.type(screen.getByLabelText(/category/i), 'Work')
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: today } })
    await userEvent.click(screen.getByRole('button', { name: /add task/i }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it('shows error when title contains < or >', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/task title/i), '<script>xss</script>')
    await userEvent.type(screen.getByLabelText(/description/i), 'Desc')
    await userEvent.type(screen.getByLabelText(/category/i), 'Work')
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-12-31' } })
    submitViaForm()
    await waitFor(() =>
      expect(screen.getByText(/contains invalid characters/i)).toBeInTheDocument()
    )
  })

  it('rejects title containing an apostrophe', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/task title/i), "John's task")
    await userEvent.type(screen.getByLabelText(/description/i), 'Desc')
    await userEvent.type(screen.getByLabelText(/category/i), 'Work')
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-12-31' } })
    submitViaForm()
    await waitFor(() =>
      expect(screen.getByText(/contains invalid characters/i)).toBeInTheDocument()
    )
  })

  it('rejects title containing a semicolon', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/task title/i), 'Fix bug; deploy')
    await userEvent.type(screen.getByLabelText(/description/i), 'Desc')
    await userEvent.type(screen.getByLabelText(/category/i), 'Work')
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-12-31' } })
    submitViaForm()
    await waitFor(() =>
      expect(screen.getByText(/contains invalid characters/i)).toBeInTheDocument()
    )
  })

  it('accepts title with hyphens, digits and parentheses', async () => {
    const { onSuccess } = renderForm()
    await userEvent.type(screen.getByLabelText(/task title/i), 'Fix auth-flow (v2.0) #42')
    await userEvent.type(screen.getByLabelText(/description/i), 'Desc')
    await userEvent.type(screen.getByLabelText(/category/i), 'Work')
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-12-31' } })
    await userEvent.click(screen.getByRole('button', { name: /add task/i }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })
})
