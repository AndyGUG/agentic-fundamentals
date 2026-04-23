import type { Task, TaskStatus } from '../types'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: TaskStatus) => void
}

function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'TODO': return 'status-todo'
    case 'IN_PROGRESS': return 'status-in-progress'
    case 'DONE': return 'status-done'
    default: return ''
  }
}

function getStatusLabel(status: TaskStatus): string {
  return status.replace(/_/g, ' ')
}

export function TaskItem({ task, onEdit, onDelete, onStatusChange }: TaskItemProps) {
  return (
    <li className={`task-item ${getStatusColor(task.status)}`}>
      <div className="task-content">
        <div className="task-header">
          <h3>{task.title} <span className="task-id">(ID: {String(task.id).padStart(4, '0')})</span></h3>
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
              day: 'numeric',
            })}
          </p>
        )}
      </div>
      <div className="task-actions">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="status-select"
          title="Change task status"
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        <button className="btn-edit" onClick={() => onEdit(task)} title="Edit task">
          ✏️ Edit
        </button>
        <button className="btn-delete" onClick={() => onDelete(task.id)} title="Delete task">
          🗑️ Delete
        </button>
      </div>
    </li>
  )
}
