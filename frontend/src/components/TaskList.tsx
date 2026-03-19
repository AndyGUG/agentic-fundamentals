import { useState } from 'react'
import type { Task, TaskStatus, SortBy } from '../types'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: TaskStatus) => void
}

export function TaskList({ tasks, loading, onEdit, onDelete, onStatusChange }: TaskListProps) {
  const [sortBy, setSortBy] = useState<SortBy>('created')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  const getUniqueCategories = (): string[] => {
    const categories = new Set<string>()
    tasks.forEach((task) => { if (task.category) categories.add(task.category) })
    return Array.from(categories).sort()
  }

  const sortTasks = (tasksToSort: Task[]): Task[] => {
    const sorted = [...tasksToSort]
    switch (sortBy) {
      case 'status': {
        const order = { TODO: 0, IN_PROGRESS: 1, DONE: 2 }
        return sorted.sort((a, b) => order[a.status] - order[b.status])
      }
      case 'dueDate':
        return sorted.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category))
      default:
        return sorted
    }
  }

  const visible = sortTasks(
    tasks.filter((task) => {
      const matchesSearch =
        searchTerm === '' ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filterCategory || task.category === filterCategory
      return matchesSearch && matchesCategory
    })
  )

  return (
    <div className="tasks-section">
      <div className="tasks-header">
        <h2>Tasks ({visible.length})</h2>
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
          {getUniqueCategories().map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">⏳ Loading tasks...</div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <p>{searchTerm || filterCategory
            ? '🔍 No tasks match your filters.'
            : '🎉 No tasks yet. Create one to get started!'}</p>
        </div>
      ) : (
        <ul className="task-list">
          {visible.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
