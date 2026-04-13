# Testing Guide

## Overview

This project uses a multi-layer testing strategy covering the backend (Java/Spring Boot) and frontend (React/TypeScript).

| Layer | Tool | Location | Command |
|---|---|---|---|
| Backend unit & slice | JUnit 5 + Mockito + MockMvc | `backend/src/test/` | `mvn test` |
| Backend repository | JUnit 5 + `@DataJpaTest` + H2 | `backend/src/test/` | `mvn test` |
| Backend integration | JUnit 5 + Testcontainers + PostgreSQL | `backend/src/test/` | `mvn verify` |
| Frontend unit & component | Vitest + React Testing Library | `frontend/src/test/` | `npm test` |
| Frontend API | Vitest (fetch mocked) | `frontend/src/test/` | `npm test` |
| End-to-end | Playwright | `frontend/e2e/` | `npm run test:e2e` |
| Linting | ESLint | frontend source | `npm run lint` |
| Coverage (backend) | JaCoCo | `backend/target/site/jacoco/` | `mvn verify` |
| Coverage (frontend) | `@vitest/coverage-v8` | `frontend/coverage/` | `npm run test:coverage` |

---

## Backend Tests

### Prerequisites
- Java 21+
- Maven 3.9+
- Docker (required only for integration tests / `mvn verify`)

### Unit Tests – `TaskServiceTest`

**File:** `backend/src/test/java/com/taskmanager/service/TaskServiceTest.java`  
**Tool:** JUnit 5 + Mockito  
**Run:** `mvn test`

Tests the service layer in isolation with a mocked repository.

| Test | Description |
|---|---|
| `getAllTasks_returnsList` | Returns all tasks from repository |
| `getTaskById_found_returnsOptional` | Returns `Optional<Task>` when found |
| `getTaskById_notFound_returnsEmpty` | Returns empty `Optional` when not found |
| `createTask_withStatus_savesAsIs` | Persists task with provided status |
| `createTask_withNullStatus_defaultsToTodo` | Defaults status to `TODO` when null |
| `updateTask_found_updatesFields` | Updates all non-null fields |
| `updateTask_partialUpdate_onlyChangesNonNullFields` | Preserves unchanged fields |
| `updateTask_notFound_throwsTaskNotFoundException` | Throws `TaskNotFoundException` for missing ID |
| `deleteTask_found_callsRepository` | Calls `deleteById` when task exists |
| `deleteTask_notFound_throwsTaskNotFoundException` | Throws `TaskNotFoundException` for missing ID |

---

### Slice Tests – `TaskControllerTest`

**File:** `backend/src/test/java/com/taskmanager/controller/TaskControllerTest.java`  
**Tool:** JUnit 5 + `@WebMvcTest` + MockMvc + Mockito  
**Run:** `mvn test`

Tests HTTP request/response handling, validation, and exception mapping without a real database.

| Test | Description |
|---|---|
| `getAllTasks_returnsOkWithList` | `GET /api/tasks` → 200 with JSON array |
| `getAllTasks_empty_returnsEmptyList` | `GET /api/tasks` → 200 with `[]` |
| `getTaskById_found_returnsOk` | `GET /api/tasks/1` → 200 |
| `getTaskById_notFound_returns404` | `GET /api/tasks/99` → 404 |
| `createTask_valid_returnsCreated` | `POST /api/tasks` (valid) → 201 |
| `createTask_missingTitle_returns400WithValidationError` | Missing `title` → 400 + error detail |
| `createTask_blankDescription_returns400` | Blank `description` → 400 |
| `createTask_titleTooLong_returns400` | `title` > 100 chars → 400 |
| `createTask_missingDueDate_returns400` | Null `dueDate` → 400 |
| `createTask_missingCategory_returns400` | Null `category` → 400 |
| `createTask_invalidStatusEnum_returns400` | Unknown enum value → 400 |
| `updateTask_found_returnsOk` | `PUT /api/tasks/1` → 200 |
| `updateTask_notFound_returns404` | `PUT /api/tasks/99` → 404 |
| `deleteTask_returnsNoContent` | `DELETE /api/tasks/1` → 204 |
| `deleteTask_notFound_returns404` | `DELETE /api/tasks/99` → 404 |

---

### Repository Tests – `TaskRepositoryTest`

**File:** `backend/src/test/java/com/taskmanager/repository/TaskRepositoryTest.java`  
**Tool:** JUnit 5 + `@DataJpaTest` + H2 in-memory  
**Run:** `mvn test`

Verifies JPA persistence without requiring a running PostgreSQL instance. H2 replaces the datasource automatically.

| Test | Description |
|---|---|
| `save_persistsTask` | Saved task receives auto-generated ID |
| `findById_existingTask_returnsTask` | Correctly retrieves persisted task |
| `findById_nonExistingId_returnsEmpty` | Returns `Optional.empty()` for unknown ID |
| `findAll_returnsAllTasks` | Returns all persisted tasks |
| `deleteById_removesTask` | Task no longer found after deletion |
| `existsById_existingTask_returnsTrue` | Returns `true` for known ID |
| `existsById_nonExistingId_returnsFalse` | Returns `false` for unknown ID |
| `save_updateExistingTask_persitsChanges` | Changes are persisted after update |

---

### Integration Tests – `TaskIntegrationIT`

**File:** `backend/src/test/java/com/taskmanager/TaskIntegrationIT.java`  
**Tool:** JUnit 5 + `@SpringBootTest` + Testcontainers (PostgreSQL 16) + `TestRestTemplate`  
**Run:** `mvn verify` (requires Docker)

Boots the full application against a real containerized PostgreSQL instance. Covers CRUD API flows end-to-end at the HTTP level.

| Test | Description |
|---|---|
| `createTask_validPayload_returns201WithBody` | Full create flow |
| `createTask_missingTitle_returns400` | Validation propagates to HTTP 400 |
| `createTask_nullStatus_defaultsToTodo` | Default status logic verified |
| `getAllTasks_returnsOk` | List endpoint responds |
| `getTaskById_existingTask_returnsOk` | Fetch by ID |
| `getTaskById_nonExistingId_returns404` | 404 for missing task |
| `updateTask_validPayload_returns200WithUpdatedData` | Update reflected in response |
| `updateTask_nonExistingId_returns404` | 404 on update of missing task |
| `deleteTask_existingTask_returns204` | Delete + verify gone |
| `deleteTask_nonExistingId_returns404` | 404 on delete of missing task |
| `fullCrudFlow_createReadUpdateDelete` | Complete lifecycle in one test |

---

## Frontend Tests

### Prerequisites
- Node.js 20+
- Run `npm install --legacy-peer-deps` in `frontend/`

### Unit Tests – API (`api.test.ts`)

**File:** `frontend/src/test/api.test.ts`  
**Tool:** Vitest  
**Run:** `npm test`

Tests `api.ts` fetch wrapper functions with a mocked global `fetch`. No network calls are made.

| Test group | Tests |
|---|---|
| `getTasks` | Calls correct endpoint, throws on error, handles empty array |
| `createTask` | Calls POST with correct body/headers, throws on error |
| `updateTask` | Calls PUT with correct URL/body, throws on 404 |
| `deleteTask` | Calls DELETE with correct URL, throws on 404 |

---

### Component Tests – `TaskForm.test.tsx`

**File:** `frontend/src/test/TaskForm.test.tsx`  
**Tool:** Vitest + React Testing Library + `@testing-library/user-event`  
**Run:** `npm test`

| Test group | Tests |
|---|---|
| Create mode | Heading shown, validation errors for empty title/description/category/dueDate, `onSuccess(data, false)` on valid submission, form resets after submit |
| Edit mode | "Edit Task" heading, fields pre-filled, Update button shown, `onSuccess(data, true)` on submit, `onCancel` called, ID field is read-only |

---

### Component Tests – `TaskItem.test.tsx`

**File:** `frontend/src/test/TaskItem.test.tsx`  
**Tool:** Vitest + React Testing Library  
**Run:** `npm test`

| Test group | Tests |
|---|---|
| Rendering | Title, description, category, due date, task ID, status badge for all 3 statuses |
| Interactions | Edit button calls `onEdit(task)`, Delete button calls `onDelete(id)`, status dropdown calls `onStatusChange(id, newStatus)`, dropdown reflects current status |

---

### Component Tests – `TaskList.test.tsx`

**File:** `frontend/src/test/TaskList.test.tsx`  
**Tool:** Vitest + React Testing Library  
**Run:** `npm test`

| Test group | Tests |
|---|---|
| Rendering | Loading state, empty state, all tasks shown, count in heading, category options |
| Search | Filters by title, filters by description, shows 0 results for no match |
| Category filter | Filters to selected category only |
| Sorting | Due date ascending order correct, status order correct (TODO → IN_PROGRESS → DONE) |

---

## End-to-End Tests (Playwright)

**File:** `frontend/e2e/tasks.spec.ts`  
**Tool:** Playwright (Chromium)  
**Run:** `npm run test:e2e`  
**Requires:** Backend running on port 8080, frontend dev server on port 3000

The Playwright config uses `reuseExistingServer: true`, so if the frontend dev server is already running it won't start a new one.

| Test | Flow |
|---|---|
| Page loads correctly | Navigates to `/`, checks headings |
| CREATE task | Fill form → submit → task appears in list |
| CREATE validation | Submit empty form → validation errors visible |
| READ task details | Create task → verify category and status badge in list |
| UPDATE task title | Create → edit → submit → updated title shown |
| UPDATE status via dropdown | Create → change status dropdown → badge updates |
| DELETE task | Create → delete (confirm dialog) → task removed |
| SEARCH filters list | Create → search by title → only matching task visible |

---

## CI/CD Pipeline

**File:** `.github/workflows/ci.yml`  
**Trigger:** Push or PR to `main` / `develop`

```
push/PR
  │
  ├─ backend-unit        mvn test          (JUnit, no Docker)
  ├─ backend-integration mvn verify        (JUnit + Testcontainers)
  ├─ frontend-unit       npm test          (Vitest)
  ├─ frontend-lint       npm run lint      (ESLint)
  │
  └─ e2e (needs unit jobs to pass)
       ├─ postgres service container
       ├─ start Spring Boot backend
       └─ npm run test:e2e  (Playwright)
```

Artifacts uploaded on each run:
- `backend-coverage` — JaCoCo HTML report
- `frontend-coverage` — V8 lcov report  
- `playwright-report` — HTML trace report (always, even on failure)

---

## Running Tests Locally

### All backend tests (unit + integration)
```bash
cd backend
mvn verify         # requires Docker for Testcontainers
```

### Backend unit/slice tests only (no Docker)
```bash
cd backend
mvn test
```

### Frontend unit tests
```bash
cd frontend
npm test
```

### Frontend unit tests with coverage
```bash
cd frontend
npm run test:coverage
# Report: frontend/coverage/index.html
```

### E2E tests (both services must be running)
```bash
# Terminal 1
cd backend && mvn spring-boot:run

# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd frontend && npm run test:e2e
```

### Interactive E2E debug UI
```bash
cd frontend && npm run test:e2e:ui
```
