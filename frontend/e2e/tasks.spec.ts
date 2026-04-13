import { test, expect, Page } from '@playwright/test'

const API = 'http://localhost:8080/api/tasks'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function fillTaskForm(page: Page, data: {
  title: string
  description: string
  category: string
  dueDate: string
  status?: string
}) {
  await page.fill('input#title', data.title)
  await page.fill('textarea#description', data.description)
  await page.fill('input#category', data.category)
  await page.fill('input#dueDate', data.dueDate)
  if (data.status) {
    await page.selectOption('select#status', data.status)
  }
}

async function submitForm(page: Page, mode: 'add' | 'update' = 'add') {
  const buttonText = mode === 'add' ? /add task/i : /update task/i
  await page.getByRole('button', { name: buttonText }).click()
}

// ─── TESTS ───────────────────────────────────────────────────────────────────

test.describe('Task Manager – CRUD flows', () => {

  // Capture IDs that exist BEFORE the suite runs so afterAll only removes what the suite created
  let preExistingIds: Set<number> = new Set()

  test.beforeAll(async ({ request }) => {
    const res = await request.get(API)
    const tasks: { id: number }[] = await res.json()
    preExistingIds = new Set(tasks.map(t => t.id))
  })

  test.afterAll(async ({ request }) => {
    const res = await request.get(API)
    const tasks: { id: number }[] = await res.json()
    for (const task of tasks) {
      if (!preExistingIds.has(task.id)) {
        await request.delete(`${API}/${task.id}`)
      }
    }
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('page loads and shows Task Manager heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /task manager/i })).toBeVisible()
    await expect(page.getByText('Add New Task')).toBeVisible()
  })

  test('CREATE – fill and submit form creates a new task', async ({ page }) => {
    const title = `E2E Task ${Date.now()}`

    await fillTaskForm(page, {
      title,
      description: 'Created by Playwright E2E test',
      category: 'E2E Testing',
      dueDate: '2026-12-31',
    })
    await submitForm(page, 'add')

    await expect(page.getByText(title)).toBeVisible()
  })

  test('CREATE – submitting empty form shows validation errors', async ({ page }) => {
    // Bypass native HTML5 required-field validation by submitting via JS
    await page.evaluate(() => {
      const form = document.querySelector('form') as HTMLFormElement
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    await expect(page.getByText('Title is required')).toBeVisible()
    await expect(page.getByText('Description is required')).toBeVisible()
  })

  test('READ – created task appears in the list with correct details', async ({ page }) => {
    const title = `Read Test ${Date.now()}`

    await fillTaskForm(page, {
      title,
      description: 'Read verification task',
      category: 'QA',
      dueDate: '2026-06-15',
      status: 'IN_PROGRESS',
    })
    await submitForm(page, 'add')

    const taskItem = page.locator('li').filter({ hasText: title })
    await expect(taskItem).toBeVisible()
    await expect(taskItem.getByText('QA')).toBeVisible()
    await expect(taskItem.locator('.status-badge')).toHaveText('IN PROGRESS')
  })

  test('UPDATE – editing a task updates its title', async ({ page }) => {
    const original = `Original ${Date.now()}`
    const updated = `Updated ${Date.now()}`

    // Create
    await fillTaskForm(page, {
      title: original,
      description: 'Will be updated',
      category: 'Work',
      dueDate: '2026-10-01',
    })
    await submitForm(page, 'add')
    await expect(page.getByText(original)).toBeVisible()

    // Edit
    const taskItem = page.locator('li').filter({ hasText: original })
    await taskItem.getByTitle('Edit task').click()

    await page.fill('input#title', '')
    await page.fill('input#title', updated)
    await submitForm(page, 'update')

    await expect(page.getByText(updated)).toBeVisible()
    await expect(page.getByText(original)).not.toBeVisible()
  })

  test('UPDATE – changing status via dropdown updates badge', async ({ page }) => {
    const title = `Status Test ${Date.now()}`

    await fillTaskForm(page, {
      title,
      description: 'Status change test',
      category: 'Work',
      dueDate: '2026-09-01',
    })
    await submitForm(page, 'add')

    const taskItem = page.locator('li').filter({ hasText: title })
    await taskItem.getByTitle('Change task status').selectOption('DONE')

    await expect(taskItem.locator('.status-badge')).toHaveText('DONE')
  })

  test('DELETE – deleting a task removes it from the list', async ({ page }) => {
    const title = `Delete Me ${Date.now()}`

    await fillTaskForm(page, {
      title,
      description: 'Will be deleted',
      category: 'Temp',
      dueDate: '2026-07-01',
    })
    await submitForm(page, 'add')
    await expect(page.getByText(title)).toBeVisible()

    // Accept confirm dialog
    page.on('dialog', dialog => dialog.accept())
    const taskItem = page.locator('li').filter({ hasText: title })
    await taskItem.getByTitle('Delete task').click()

    await expect(page.getByText(title)).not.toBeVisible()
  })

  test('SEARCH – search filters task list by title', async ({ page }) => {
    const uniqueTitle = `Searchable ${Date.now()}`

    await fillTaskForm(page, {
      title: uniqueTitle,
      description: 'For search test',
      category: 'Search',
      dueDate: '2026-08-01',
    })
    await submitForm(page, 'add')

    await page.fill('input[placeholder*="Search"]', uniqueTitle)
    await expect(page.getByText(uniqueTitle)).toBeVisible()

    // Clear search
    await page.fill('input[placeholder*="Search"]', 'zzznomatch')
    await expect(page.getByText(uniqueTitle)).not.toBeVisible()
  })

})
