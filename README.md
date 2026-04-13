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
| Spring Boot | 3.2.1 | Application framework |
| Spring Web | — | REST API |
| Spring Data JPA | — | ORM / data access |
| Spring Validation | — | Bean validation (JSR-380) |
| PostgreSQL Driver | 42.7 | Database connectivity |
| JUnit 5 | — | Unit and integration testing |
| Mockito | 5.15 | Mocking in tests |
| JaCoCo | 0.8.13 | Code coverage |
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
- Node.js 18+
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

## Prerequisites

- **Node.js** 16+ and npm
- **Java 17+**
- **Maven 3.6+**
- **PostgreSQL 12+**

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```bash
createdb task_manager_db
```

Or using psql:
```sql
CREATE DATABASE task_manager_db;
```

Update `backend/src/main/resources/application.properties` if using different credentials:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Build the project:

```bash
mvn clean install
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Tasks

- **GET /api/tasks** - Get all tasks
- **GET /api/tasks/{id}** - Get task by ID
- **POST /api/tasks** - Create a new task
- **PUT /api/tasks/{id}** - Update a task
- **DELETE /api/tasks/{id}** - Delete a task

### Request/Response Format

**Create Task (POST)**
```json
{
  "title": "Task Title",
  "description": "Task Description",
  "status": "TODO",
  "dueDate": "2026-05-01",
  "category": "Backend"
}
```

**Task Response**
```json
{
  "id": 1,
  "title": "Task Title",
  "description": "Task Description",
  "status": "TODO",
  "dueDate": "2026-05-01",
  "category": "Backend"
}
```

## Features

- ✅ Create, read, update, and delete tasks
- ✅ Status tracking: TODO → IN_PROGRESS → DONE
- ✅ Category-based filtering and free-text search
- ✅ Sort by due date or status
- ✅ Client- and server-side validation with field-level error messages
- ✅ Harmful character blocking on all text inputs (`<>"'\`&;%$\`)
- ✅ Due-date validation: past dates rejected
- ✅ Browser autofill disabled (`autoComplete="off"`) on all form fields
- ✅ Category history stored in localStorage (latest 3 entries)
- ✅ CORS configured for local development
- ✅ Responsive design

## Development Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend

- `mvn clean install` - Clean and build
- `mvn spring-boot:run` - Run application
- `mvn test` - Run tests
- `mvn package` - Create JAR file

## Environment Configuration

### Frontend (vite.config.ts)
The frontend is configured to proxy API calls to the backend:
```
/api/* → http://localhost:8080/api/*
```

### Backend (application.properties)
- Database URL: `jdbc:postgresql://localhost:5432/task_manager_db`
- Server Port: `8080`
- CORS: Enabled for `http://localhost:3000`

## Building for Production

### Frontend
```bash
cd frontend
npm run build
# Output in: frontend/dist
```

### Backend
```bash
cd backend
mvn package
# Output: backend/target/task-manager-backend-0.0.1-SNAPSHOT.jar
```

## Troubleshooting

**Database Connection Error**
- Ensure PostgreSQL is running
- Verify database name, username, and password in `application.properties`
- Create database if it doesn't exist

**Frontend Can't Connect to Backend**
- Ensure backend is running on port 8080
- Check CORS configuration in `TaskManagerApplication.java`
- Verify proxy settings in `vite.config.ts`

**Build Errors**
- Clear Maven cache: `mvn clean`
- Clear Node modules: `rm -rf frontend/node_modules && npm install`
- Ensure correct Java version: `java -version` (should be 17+)

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT License - feel free to use this project as a template.

## Support

For issues and questions, please create an issue in the repository.
