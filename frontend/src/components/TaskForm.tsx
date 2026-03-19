import { useState, useEffect } from 'react'
import type { Task, TaskStatus, FormErrors } from '../types'

interface TaskFormProps {
  editingTask: Task | null
  onSuccess: (task: Task, isUpdate: boolean) => void
  onCancel: () => void
}

export function TaskForm({ editingTask, onSuccess, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description)
      setStatus(editingTask.status)
      setDueDate(editingTask.dueDate || '')
      setCategory(editingTask.category || '')
    } else {
      resetFields()
    }
  }, [editingTask])

  const resetFields = () => {
    setTitle('')
    setDescription('')
    setStatus('TODO')
    setDueDate('')
    setCategory('')
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!title.trim()) errors.title = 'Title is required'
    else if (title.length > 100) errors.title = 'Title must be 100 characters or less'

    if (!description.trim()) errors.description = 'Description is required'
    else if (description.length > 500) errors.description = 'Description must be 500 characters or less'

    if (!category.trim()) errors.category = 'Category is required'
    if (!dueDate) errors.dueDate = 'Due date is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status: status || 'TODO' as TaskStatus,
      dueDate: dueDate.trim(),
      category: category.trim(),
    }

    if (editingTask) {
      onSuccess({ ...editingTask, ...taskData }, true)
    } else {
      onSuccess(taskData as unknown as Task, false)
    }
    resetFields()
  }

  return (
    <div className="form-section">
      <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
      <form onSubmit={handleSubmit} className="form">
        {editingTask && (
          <div className="form-group">
            <label htmlFor="taskId">ID</label>
            <input id="taskId" type="text" value={editingTask.id} disabled className="id-field" />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <input
            id="title"
            type="text"
            placeholder="Enter task title (max 100 chars)"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value.slice(0, 100))
              if (formErrors.title) setFormErrors({ ...formErrors, title: undefined })
            }}
            maxLength={100}
            className={formErrors.title ? 'error' : ''}
            required
          />
          {formErrors.title && <span className="field-error">{formErrors.title}</span>}
          <span className="char-count">{title.length}/100</span>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            placeholder="Enter task description (max 500 chars)"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value.slice(0, 500))
              if (formErrors.description) setFormErrors({ ...formErrors, description: undefined })
            }}
            maxLength={500}
            rows={3}
            className={formErrors.description ? 'error' : ''}
            required
          />
          {formErrors.description && <span className="field-error">{formErrors.description}</span>}
          <span className="char-count">{description.length}/500</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              <option value="TODO">📌 TODO</option>
              <option value="IN_PROGRESS">⏳ In Progress</option>
              <option value="DONE">✅ Done</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <input
              id="category"
              type="text"
              placeholder="Enter category (e.g., Work, Personal)"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value.slice(0, 50))
                if (formErrors.category) setFormErrors({ ...formErrors, category: undefined })
              }}
              maxLength={50}
              className={formErrors.category ? 'error' : ''}
              required
            />
            {formErrors.category && <span className="field-error">{formErrors.category}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date *</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value)
              if (formErrors.dueDate) setFormErrors({ ...formErrors, dueDate: undefined })
            }}
            className={formErrors.dueDate ? 'error' : ''}
            required
          />
          {formErrors.dueDate && <span className="field-error">{formErrors.dueDate}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingTask ? '💾 Update Task' : '➕ Add Task'}
          </button>
          {editingTask && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              ❌ Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
