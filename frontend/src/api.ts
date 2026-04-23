import type { Task } from './types'

const BASE = '/api/tasks'
const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
}

export async function createTask(data: Omit<Task, 'id'>): Promise<Task> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Failed to create task')
  }
  return res.json()
}

export async function updateTask(id: number, data: Task): Promise<Task> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update task')
  return res.json()
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete task')
}
