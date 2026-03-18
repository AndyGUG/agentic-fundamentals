import { useState, useEffect } from 'react'
import './App.css'

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
type SortBy = 'status' | 'dueDate' | 'created' | 'category'

interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  dueDate: string | null
  category: string
}

interface FormErrors {
  title?: string
  description?: string
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [editingId, setEditingId] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>('created')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching tasks')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!title.trim()) {
      errors.title = 'Title is required'
    } else if (title.length > 100) {
      errors.title = 'Title must be 100 characters or less'
    }

    if (!description.trim()) {
      errors.description = 'Description is required'
    } else if (description.length > 500) {
      errors.description = 'Description must be 500 characters or less'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setStatus('TODO')
    setDueDate('')
    setCategory('')
    setFormErrors({})
    setEditingId(null)
  }

  const addOrUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // Validate required fields
    if (!category.trim()) {
      setError('Category is required')
      return
    }
    if (!dueDate || dueDate.trim() === '') {
      setError('Due date is required')
      return
    }

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        status: status || 'TODO',
        dueDate: dueDate.trim(),
        category: category.trim()
      }

      if (editingId) {
        // Update existing task
        const response = await fetch(`/api/tasks/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...tasks.find(t => t.id === editingId), ...taskData })
        })
        if (!response.ok) throw new Error('Failed to update task')
        const updated = await response.json()
        setTasks(tasks.map(t => t.id === editingId ? updated : t))
        setError(null)
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        })
        if (!response.ok) throw new Error('Failed to create task')
        const newTask = await response.json()
        setTasks([...tasks, newTask])
        setError(null)
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
    }
  }

  const startEdit = (task: Task) => {
    setTitle(task.title)
    setDescription(task.description)
    setStatus(task.status)
    setDueDate(task.dueDate || '')
    setCategory(task.category || '')
    setEditingId(task.id)
    setFormErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    resetForm()
  }

  const updateTaskStatus = async (id: number, newStatus: TaskStatus) => {
    try {
      const task = tasks.find(t => t.id === id)
      if (!task) return
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus })
      })
      if (!response.ok) throw new Error('Failed to update task status')
      const updated = await response.json()
      setTasks(tasks.map(t => t.id === id ? updated : t))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status')
    }
  }

  const deleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete task')
      setTasks(tasks.filter(t => t.id !== id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'TODO': return 'status-todo'
      case 'IN_PROGRESS': return 'status-in-progress'
      case 'DONE': return 'status-done'
      default: return ''
    }
  }

  const getStatusLabel = (status: TaskStatus): string => {
    return status.replace(/_/g, ' ')
  }

  const sortTasks = (tasksToSort: Task[]): Task[] => {
    const sorted = [...tasksToSort]
    switch (sortBy) {
      case 'status':
        return sorted.sort((a, b) => {
          const statusOrder = { TODO: 0, IN_PROGRESS: 1, DONE: 2 }
          return statusOrder[a.status] - statusOrder[b.status]
        })
      case 'dueDate':
        return sorted.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category))
      case 'created':
      default:
        return sorted
    }
  }

  const filterAndSortTasks = (): Task[] => {
    let filtered = tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filterCategory || task.category === filterCategory
      return matchesSearch && matchesCategory
    })
    return sortTasks(filtered)
  }

  const getUniqueCategories = (): string[] => {
    const categories = new Set<string>()
    tasks.forEach(task => {
      if (task.category) {
        categories.add(task.category)
      }
    })
    return Array.from(categories).sort()
  }

  const filteredAndSortedTasks = filterAndSortTasks()

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>📋 Task Manager</h1>
          <img src="/logo-white.png" alt="S&PE Logo" className="header-logo" />
          <img src="/Accenture-Emblem.png" alt="Accenture Logo" className="accenture-logo" />
        </div>
      </header>

      {error && (
        <div className="error">
          <span>⚠️ {error}</span>
          <button className="close-btn" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="main-content">
        <div className="form-section">
          <h2>{editingId ? 'Edit Task' : 'Add New Task'}</h2>
          <form onSubmit={addOrUpdateTask} className="form">
            {editingId && (
              <div className="form-group">
                <label htmlFor="taskId">ID</label>
                <input
                  id="taskId"
                  type="text"
                  value={editingId}
                  disabled
                  className="id-field"
                />
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
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                >
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
                  onChange={(e) => setCategory(e.target.value.slice(0, 50))}
                  maxLength={50}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date *</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? '💾 Update Task' : '➕ Add Task'}
              </button>
              {editingId && (
                <button type="button" className="btn-secondary" onClick={cancelEdit}>
                  ❌ Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Tasks ({filteredAndSortedTasks.length})</h2>
            <div className="sort-controls">
              <label htmlFor="sortBy">Sort by:</label>
              <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
                <option value="created">Created (default)</option>
                <option value="status">Status</option>
                <option value="dueDate">Due Date</option>
                <option value="category">Category (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="filter-controls">
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterCategory || ''}
              onChange={(e) => setFilterCategory(e.target.value || null)}
              className="category-filter"
            >
              <option value="">📂 All Categories</option>
              {getUniqueCategories().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="loading">⏳ Loading tasks...</div>
          ) : filteredAndSortedTasks.length === 0 ? (
            <div className="empty">
              <p>{searchTerm || filterCategory ? '🔍 No tasks match your filters.' : '🎉 No tasks yet. Create one to get started!'}</p>
            </div>
          ) : (
            <ul className="task-list">
              {filteredAndSortedTasks.map((task) => (
                <li key={task.id} className={`task-item ${getStatusColor(task.status)}`}>
                  <div className="task-content">
                    <div className="task-header">
                      <h3>{task.title} <span className="task-id">(ID: {task.id})</span></h3>
                      <span className={`status-badge ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                    {task.description && <p className="description">{task.description}</p>}
                    {task.category && <p className="category-badge">📂 {task.category}</p>}
                    {task.dueDate && (
                      <p className="due-date">
                        📅 Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                  <div className="task-actions">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                      className="status-select"
                      title="Change task status"
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                    <button
                      className="btn-edit"
                      onClick={() => startEdit(task)}
                      title="Edit task"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
