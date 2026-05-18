# Testing Guide

This document describes how to run all tests in the Task Manager project.

---

## Prerequisites

Both servers must be running for end-to-end tests:

```bash
# Terminal 1 – backend
cd backend && mvn spring-boot:run

# Terminal 2 – frontend
cd frontend && npm run dev
```

---

## Backend Tests

### Unit tests only

```bash
cd backend
mvn test
```

Runs `TaskRepositoryTest`, `TaskControllerTest`, `TaskServiceTest` via Surefire.

### Unit + integration tests

```bash
cd backend
mvn verify
```

Also runs `TaskIntegrationIT` via Failsafe against an in-memory H2 database.

### Coverage report

```bash
cd backend
mvn verify
open target/site/jacoco/index.html
```

---

## Frontend Tests

### Unit tests

```bash
cd frontend
npm test
```

Runs Vitest in watch mode. For a single CI-style run:

```bash
npm test -- --run
```

### Unit tests with coverage

```bash
cd frontend
npm run test:coverage
```

### End-to-end tests

Requires both servers running (see Prerequisites above).

```bash
cd frontend
npm run test:e2e
```

To run a specific test file:

```bash
npx playwright test e2e/tasks.spec.ts
```

To open the Playwright UI runner:

```bash
npx playwright test --ui
```

---

## Security Scans

### Static code analysis (OWASP Top 10)

```bash
cd backend
mvn spotbugs:check
```

Runs SpotBugs with Find Security Bugs. No internet access required.

### Frontend dependency audit

```bash
cd frontend
npm audit
```

### Backend dependency vulnerabilities (NVD)

Requires a free [NVD API key](https://nvd.nist.gov/developers/request-an-api-key). The initial database download takes ~5 minutes with the key.

```bash
cd backend
mvn org.owasp:dependency-check-maven:check -DfailBuildOnCVSS=7 -DnvdApiKey=YOUR_KEY
```

---

## Run Everything

```bash
# Backend: unit + integration + static analysis
cd backend && mvn verify && mvn spotbugs:check

# Frontend: unit + e2e + audit
cd frontend && npm test -- --run && npm run test:e2e && npm audit
```
