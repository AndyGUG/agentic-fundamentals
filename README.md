# Task Manager

A full-stack task management application built with **React + TypeScript** on the frontend and **Spring Boot + PostgreSQL** on the backend. Users can create, view, edit, and delete tasks, filter and sort them by category, title, or due date, and track their progress through status transitions (TODO → IN_PROGRESS → DONE).

---

## Features

- **Create** tasks with title, description, category, due date, and status
- **Read** all tasks or fetch a single task by ID
- **Update** task details and status inline
- **Delete** tasks with confirmation
- Filter tasks by category and free-text search (title + description)
- Sort tasks by due date or status
- Client-side form validation with field-level error messages
- Server-side validation with structured error responses
- CORS configured for local development

---

## Architecture

```
task_manager/
├── frontend/               # React SPA (port 3000)
│   ├── src/
│   │   ├── api.ts          # Fetch-based API client
│   │   ├── types.ts        # Shared TypeScript types
│   │   ├── App.tsx         # Root component
│   │   └── components/
│   │       ├── TaskForm.tsx    # Create / edit form
│   │       ├── TaskItem.tsx    # Single task card
│   │       └── TaskList.tsx    # Filterable, sortable list
│   ├── e2e/                # Playwright end-to-end tests
│   └── src/test/           # Vitest unit tests
│
├── backend/                # Spring Boot REST API (port 8080)
│   └── src/main/java/com/taskmanager/
│       ├── controller/     # REST endpoints
│       ├── service/        # Business logic
│       ├── model/          # JPA entity
│       ├── repository/     # Spring Data JPA
│       ├── exception/      # Global error handling
│       └── config/         # CORS configuration
│
└── .github/workflows/      # GitHub Actions CI/CD pipeline
```

---

## REST API

Base URL: `http://localhost:8080/api/tasks`

| Method | Endpoint           | Description            | Success |
|--------|--------------------|------------------------|---------|
| GET    | `/api/tasks`       | List all tasks         | 200     |
| GET    | `/api/tasks/{id}`  | Get task by ID         | 200     |
| POST   | `/api/tasks`       | Create a new task      | 201     |
| PUT    | `/api/tasks/{id}`  | Update an existing task| 200     |
| DELETE | `/api/tasks/{id}`  | Delete a task          | 204     |

### Task object

```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "Null pointer in auth flow",
  "status": "IN_PROGRESS",
  "dueDate": "2026-05-01",
  "category": "Backend"
}
```

**Status values:** `TODO` | `IN_PROGRESS` | `DONE`

### Validation rules

| Field        | Constraints                                                                |
|--------------|----------------------------------------------------------------------------|
| `title`      | Required, 1–50 characters, no harmful characters (`<>"'\`&;%$\`)          |
| `description`| Required, 1–500 characters, no harmful characters (`<>"'\`&;%$\`)         |
| `status`     | Required, must be a valid enum value                                       |
| `dueDate`    | Required, must be today or a future date                                   |
| `category`   | Required, 1–50 characters, no harmful characters (`<>"'\`&;%$\`)          |

Validation errors return HTTP 400 with a structured body:
```json
{ "errors": { "title": "Title is required" } }
```

---

## Technologies

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI component library |
| TypeScript | 5.2 | Static type checking |
| Vite | 8.0 | Build tool and dev server |
| Fetch API | — | HTTP client (built-in) |
| Vitest | 4.1 | Unit test runner |
| React Testing Library | 16 | Component testing |
| Playwright | 1.59 | End-to-end testing |
| ESLint | 8.55 | Linting |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 21 (target) | Language |
| Spring Boot | 3.5.14 | Application framework |
| Spring Web | — | REST API |
| Spring Data JPA | — | ORM / data access |
| Spring Validation | — | Bean validation (JSR-380) |
| PostgreSQL Driver | 42.7 | Database connectivity |
| JUnit 5 | — | Unit and integration testing |
| Mockito | 5.15 | Mocking in tests |
| JaCoCo | 0.8.13 | Code coverage |
| SpotBugs | 4.9.8 | Static analysis |
| Find Security Bugs | 1.13.0 | OWASP Top 10 code scanning |
| Maven | 3 | Build and dependency management |

### Database
| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | 16 | Primary datastore |

### CI/CD
| Technology | Purpose |
|---|---|
| GitHub Actions | Automated test pipeline (unit, integration, frontend, E2E) |

---

## Getting Started

### Prerequisites

- Java 21+
- Node.js 20+
- PostgreSQL 14+
- Maven 3.8+

### Database setup

```bash
createdb task_manager_db        # main database
createdb task_manager_it_db     # integration test database
```

### Backend

```bash
cd backend
mvn spring-boot:run
```

The API is available at `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app is available at `http://localhost:3000`. API requests are proxied to port 8080.

---

## Running Tests

### Backend unit tests

```bash
cd backend
mvn test
```

### Backend unit + integration tests

```bash
cd backend
mvn verify
```

### Frontend unit tests

```bash
cd frontend
npm test
```

### Frontend coverage report

```bash
cd frontend
npm run test:coverage
```

### End-to-end tests (requires both servers running)

```bash
cd frontend
npm run test:e2e
```

---

## Environment Variables

The backend supports the following environment variables (with defaults for local development):

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/task_manager_db` | Database JDBC URL |
| `DB_USERNAME` | `a.guggenbichler` | Database user |
| `DB_PASSWORD` | _(empty)_ | Database password |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |


### Communication
- **REST API** - Standard HTTP/JSON communication

---

## Security

### Static code analysis (OWASP Top 10)

```bash
cd backend
mvn spotbugs:check
```

Runs SpotBugs with Find Security Bugs to check for OWASP Top 10 code-level vulnerabilities (SQL injection, XSS, insecure deserialization, etc.). No internet access required.

### Frontend dependency audit

```bash
cd frontend
npm audit
```

### Backend dependency vulnerabilities (NVD)

Requires a free [NVD API key](https://nvd.nist.gov/developers/request-an-api-key):

```bash
cd backend
mvn org.owasp:dependency-check-maven:check -DfailBuildOnCVSS=7 -DnvdApiKey=YOUR_KEY
```

---

## Troubleshooting

**Database Connection Error**
- Ensure PostgreSQL is running
- Verify database name, username, and password in `application.properties`
- Create database if it doesn't exist: `createdb task_manager_db`

**Frontend Can't Connect to Backend**
- Ensure backend is running on port 8080
- Check CORS configuration in `TaskManagerApplication.java`
- Verify proxy settings in `vite.config.ts`

**Build Errors**
- Clear Maven cache: `mvn clean`
- Clear Node modules: `rm -rf frontend/node_modules && npm install`
- Ensure correct Java version: `java -version` (should be 21+)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run all tests: `cd backend && mvn verify` and `cd frontend && npm test && npm run test:e2e`
4. Submit a pull request

## License

MIT License - feel free to use this project as a template.
