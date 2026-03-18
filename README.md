# Task Manager - Full Stack Application

A modern full-stack task management application built with React, TypeScript, Spring Boot, and PostgreSQL.

## Project Structure

```
task_manager/
├── frontend/                 # React.js + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx          # Main App component
│   │   ├── App.css          # App styles
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # Frontend dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite configuration
│   └── index.html           # HTML template
│
├── backend/                  # Spring Boot + Maven
│   ├── src/main/java/com/taskmanager/
│   │   ├── TaskManagerApplication.java
│   │   ├── controller/      # REST Controllers
│   │   ├── service/         # Business Logic
│   │   ├── model/           # Entity Classes
│   │   └── repository/      # Data Access Layer
│   ├── src/main/resources/
│   │   └── application.properties  # Spring configuration
│   └── pom.xml              # Maven configuration
│
└── README.md                # This file
```

## Technologies Used

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Axios** - HTTP client (via fetch API in current implementation)

### Backend
- **Spring Boot 3.2** - Framework
- **Java 17** - Programming language
- **Spring Data JPA** - ORM
- **Spring Web** - REST API
- **Lombok** - Code generation

### Database
- **PostgreSQL** - Relational database

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
  "completed": false
}
```

**Task Response**
```json
{
  "id": 1,
  "title": "Task Title",
  "description": "Task Description",
  "completed": false
}
```

## Features

- ✅ Create, read, update, and delete tasks
- ✅ Mark tasks as completed
- ✅ Task descriptions
- ✅ Real-time UI updates
- ✅ Error handling and user feedback
- ✅ CORS enabled for frontend-backend communication
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
