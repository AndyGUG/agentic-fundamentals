export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type SortBy = 'status' | 'dueDate' | 'created' | 'category'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  dueDate: string | null
  category: string
}

export interface FormErrors {
  title?: string
  description?: string
  category?: string
  dueDate?: string
}
