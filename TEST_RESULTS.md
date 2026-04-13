# Test Run Results

## Run Summary

| Date | 2026-04-13 |
|---|---|
| Time | 14:50 CEST |
| Operator | a.guggenbichler |
| Result | **ALL TESTS PASSED** |

### Changes since previous run

- Title max length reduced: 100 → 50 chars (backend `@Size`, `@Column`; frontend `maxLength`, `slice`, counter)
- Harmful character validation (`<>"'\`&;%$\`) added to all text fields (client + server)
- Due-date past validation added (client + server: `@FutureOrPresent`)
- Category history: localStorage-backed, max 3 newest entries, chips removed from UI display
- `autoComplete="off"` on form element and all text inputs to block browser autofill
- `LocalStorageMock` added to `src/test/setup.ts` for jsdom compatibility
- `vite.config.ts`: added `environmentOptions.jsdom.url = 'http://localhost'`  
- Backend `TaskControllerTest`: 15 → 19 tests (added harmful-char, SQL injection, apostrophe, HTML tag cases)
- Frontend `TaskForm.test.tsx`: 13 → 19 tests (added validation edge cases)

### Environment

| Component | Version |
|---|---|
| Java | 25.0.2 (Homebrew) |
| Maven | 3.9.12 |
| Node.js | 25.4.0 |
| PostgreSQL | 14.20 |
| OS | macOS 15.7.4 |

---

## Backend – Unit & Integration Tests

**Command:** `cd backend && mvn verify`

### Unit Tests (Surefire – `mvn test`)

| Test Class | Tests | Failures | Errors | Skipped | Duration |
|---|---|---|---|---|---|
| `TaskRepositoryTest` | 8 | 0 | 0 | 0 | ~2.9 s |
| `TaskControllerTest` | 19 | 0 | 0 | 0 | ~0.6 s |
| `TaskServiceTest` | 10 | 0 | 0 | 0 | ~0.1 s |
| **Subtotal** | **37** | **0** | **0** | **0** | |

### Integration Tests (Failsafe – `mvn verify`)

| Test Class | Tests | Failures | Errors | Skipped | Duration |
|---|---|---|---|---|---|
| `TaskIntegrationIT` | 11 | 0 | 0 | 0 | ~3.5 s |
| **Subtotal** | **11** | **0** | **0** | **0** | |

### Backend Result

```
[INFO] Tests run: 37, Failures: 0, Errors: 0, Skipped: 0        ← unit tests
[INFO] Tests run: 11, Failures: 0, Errors: 0, Skipped: 0        ← integration tests
[INFO] BUILD SUCCESS
```

---

## Frontend – Unit Tests

**Command:** `cd frontend && npm test`  
**Runner:** Vitest 4.1.4

| Test File | Tests | Duration |
|---|---|---|
| `src/test/api.test.ts` | 9 | ~6 ms |
| `src/test/TaskItem.test.tsx` | 12 | ~140 ms |
| `src/test/TaskList.test.tsx` | 11 | ~250 ms |
| `src/test/TaskForm.test.tsx` | 19 | ~420 ms |
| **Subtotal** | **51** | |

### Frontend Unit Result

```
 Test Files  4 passed (4)
      Tests  51 passed (51)
   Duration  ~1.8s
```

---

## Frontend – End-to-End Tests

**Command:** `cd frontend && npm run test:e2e`  
**Runner:** Playwright 1.59.1 · Browser: Chromium  
**Prerequisites at run time:** Backend on `http://localhost:8080`, Frontend on `http://localhost:3000`

| # | Test | Duration | Result |
|---|---|---|---|
| 1 | `page loads and shows Task Manager heading` | 1.3 s | ✅ passed |
| 2 | `CREATE – fill and submit form creates a new task` | 1.1 s | ✅ passed |
| 3 | `CREATE – submitting empty form shows validation errors` | 0.9 s | ✅ passed |
| 4 | `READ – created task appears in the list with correct details` | 1.1 s | ✅ passed |
| 5 | `UPDATE – editing a task updates its title` | 1.2 s | ✅ passed |
| 6 | `UPDATE – changing status via dropdown updates badge` | 1.2 s | ✅ passed |
| 7 | `DELETE – deleting a task removes it from the list` | 1.3 s | ✅ passed |
| 8 | `SEARCH – search filters task list by title` | 1.1 s | ✅ passed |

### E2E Result

```
Running 8 tests using 1 worker
8 passed (10.4s)
```

---

## Overall Summary

| Layer | Tests | Passed | Failed |
|---|---|---|---|
| Backend unit | 37 | 37 | 0 |
| Backend integration | 11 | 11 | 0 |
| Frontend unit | 51 | 51 | 0 |
| E2E (Playwright) | 8 | 8 | 0 |
| **Total** | **107** | **107** | **0** |


---

## Previous Run (2026-04-13 · 12:19 CEST)

| Layer | Tests | Passed | Failed |
|---|---|---|---|
| Backend unit | 33 | 33 | 0 |
| Backend integration | 11 | 11 | 0 |
| Frontend unit | 45 | 45 | 0 |
| E2E (Playwright) | 8 | 8 | 0 |
| **Total** | **97** | **97** | **0** |


### Environment

| Component | Version |
|---|---|
| Java | 25.0.2 (Homebrew) |
| Maven | 3.9.12 |
| Node.js | 25.4.0 |
| PostgreSQL | 14.20 |
| OS | macOS 15.7.4 |

---

## Backend – Unit & Integration Tests

**Command:** `cd backend && mvn verify`

### Unit Tests (Surefire – `mvn test`)

| Test Class | Tests | Failures | Errors | Skipped | Duration |
|---|---|---|---|---|---|
| `TaskRepositoryTest` | 8 | 0 | 0 | 0 | 2.894 s |
| `TaskControllerTest` | 15 | 0 | 0 | 0 | 0.573 s |
| `TaskServiceTest` | 10 | 0 | 0 | 0 | 0.061 s |
| **Subtotal** | **33** | **0** | **0** | **0** | |

### Integration Tests (Failsafe – `mvn verify`)

| Test Class | Tests | Failures | Errors | Skipped | Duration |
|---|---|---|---|---|---|
| `TaskIntegrationIT` | 11 | 0 | 0 | 0 | 3.541 s |
| **Subtotal** | **11** | **0** | **0** | **0** | |

### Backend Result

```
[INFO] Tests run: 33, Failures: 0, Errors: 0, Skipped: 0        ← unit tests
[INFO] Tests run: 11, Failures: 0, Errors: 0, Skipped: 0        ← integration tests
[INFO] BUILD SUCCESS
```

---

## Frontend – Unit Tests

**Command:** `cd frontend && npm test`  
**Runner:** Vitest 4.1.4

| Test File | Tests | Duration |
|---|---|---|
| `src/test/api.test.ts` | 9 | 6 ms |
| `src/test/TaskItem.test.tsx` | 12 | 139 ms |
| `src/test/TaskList.test.tsx` | 11 | 251 ms |
| `src/test/TaskForm.test.tsx` | 13 | 416 ms |
| **Subtotal** | **45** | |

### Frontend Unit Result

```
 Test Files  4 passed (4)
      Tests  45 passed (45)
   Start at  12:18:22
   Duration  1.83s
```

---

## Frontend – End-to-End Tests

**Command:** `cd frontend && npm run test:e2e`  
**Runner:** Playwright 1.59.1 · Browser: Chromium  
**Prerequisites at run time:** Backend on `http://localhost:8080`, Frontend on `http://localhost:3000`

| # | Test | Duration | Result |
|---|---|---|---|
| 1 | `page loads and shows Task Manager heading` | 1.3 s | ✅ passed |
| 2 | `CREATE – fill and submit form creates a new task` | 1.1 s | ✅ passed |
| 3 | `CREATE – submitting empty form shows validation errors` | 0.9 s | ✅ passed |
| 4 | `READ – created task appears in the list with correct details` | 1.1 s | ✅ passed |
| 5 | `UPDATE – editing a task updates its title` | 1.2 s | ✅ passed |
| 6 | `UPDATE – changing status via dropdown updates badge` | 1.2 s | ✅ passed |
| 7 | `DELETE – deleting a task removes it from the list` | 1.3 s | ✅ passed |
| 8 | `SEARCH – search filters task list by title` | 1.1 s | ✅ passed |

### E2E Result

```
Running 8 tests using 1 worker
8 passed (10.4s)
```

---

## Overall Summary

| Layer | Tests | Passed | Failed |
|---|---|---|---|
| Backend unit | 33 | 33 | 0 |
| Backend integration | 11 | 11 | 0 |
| Frontend unit | 45 | 45 | 0 |
| E2E (Playwright) | 8 | 8 | 0 |
| **Total** | **97** | **97** | **0** |
