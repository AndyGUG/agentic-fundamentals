import { useState, useEffect } from 'react'
import './App.css'
import type { Task, TaskStatus } from './types'
import { getTasks, createTask, updateTask, deleteTask } from './api'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setTasks(await getTasks())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching tasks')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const handleFormSuccess = async (taskData: Task, isUpdate: boolean) => {
    try {
      if (isUpdate) {
        const updated = await updateTask(taskData.id, taskData)
        setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)))
      } else {
        const created = await createTask(taskData)
        setTasks([...tasks, created])
      }
      setEditingTask(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await deleteTask(id)
      setTasks(tasks.filter((t) => t.id !== id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const handleStatusChange = async (id: number, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    try {
      const updated = await updateTask(id, { ...task, status: newStatus })
      setTasks(tasks.map((t) => (t.id === id ? updated : t)))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status')
    }
  }

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
        <TaskForm
          editingTask={editingTask}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditingTask(null)}
        />
        <TaskList
          tasks={tasks}
          loading={loading}
          onEdit={setEditingTask}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  )
}

export default App
