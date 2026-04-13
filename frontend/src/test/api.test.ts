import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTasks, createTask, updateTask, deleteTask } from '../api'
import type { Task } from '../types'

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test description',
  status: 'TODO',
  dueDate: '2026-12-31',
  category: 'Work',
}

function mockFetch(body: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response)
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getTasks', () => {
  it('calls GET /api/tasks and returns task array', async () => {
    mockFetch([mockTask])
    const result = await getTasks()
    expect(fetch).toHaveBeenCalledWith('/api/tasks')
    expect(result).toEqual([mockTask])
  })

  it('throws when response is not ok', async () => {
    mockFetch({}, 500)
    await expect(getTasks()).rejects.toThrow('Failed to fetch tasks')
  })

  it('returns empty array when server returns []', async () => {
    mockFetch([])
    const result = await getTasks()
    expect(result).toEqual([])
  })
})

describe('createTask', () => {
  it('calls POST /api/tasks with JSON body and returns created task', async () => {
    mockFetch(mockTask, 201)
    const { id: _, ...payload } = mockTask
    const result = await createTask(payload)
    expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }))
    expect(result).toEqual(mockTask)
  })

  it('throws when response is not ok', async () => {
    mockFetch({ errors: { title: 'required' } }, 400)
    const { id: _, ...payload } = mockTask
    await expect(createTask(payload)).rejects.toThrow('Failed to create task')
  })
})

describe('updateTask', () => {
  it('calls PUT /api/tasks/:id with JSON body and returns updated task', async () => {
    const updated = { ...mockTask, status: 'DONE' as const }
    mockFetch(updated)
    const result = await updateTask(1, updated)
    expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }))
    expect(result.status).toBe('DONE')
  })

  it('throws when task not found', async () => {
    mockFetch({ message: 'Task not found' }, 404)
    await expect(updateTask(999, mockTask)).rejects.toThrow('Failed to update task')
  })
})

describe('deleteTask', () => {
  it('calls DELETE /api/tasks/:id', async () => {
    mockFetch(null, 204)
    await deleteTask(1)
    expect(fetch).toHaveBeenCalledWith('/api/tasks/1', { method: 'DELETE' })
  })

  it('throws when task not found', async () => {
    mockFetch({ message: 'Task not found' }, 404)
    await expect(deleteTask(999)).rejects.toThrow('Failed to delete task')
  })
})
