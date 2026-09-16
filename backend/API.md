# OSLab Backend API Documentation

Complete technical specification of all RESTful endpoints implemented in the OSLab Backend Server (`backend/src`).

---

## Table of Contents
1. [Health & Diagnostics](#1-health--diagnostics)
2. [Authentication](#2-authentication)
3. [User Management](#3-user-management)
4. [Simulations Engine](#4-simulations-engine)
   - [CPU Scheduling](#cpu-scheduling)
   - [Memory Allocation](#memory-allocation)
   - [Page Replacement](#page-replacement)
   - [Disk Scheduling](#disk-scheduling)
5. [Experiment Persistence](#5-experiment-persistence)
6. [Learning Progress](#6-learning-progress)
7. [Quiz & Assessment Engine](#7-quiz--assessment-engine)
8. [Dashboard & Analytics](#8-dashboard--analytics)
9. [Mini OS Educational Runtime](#9-mini-os-educational-runtime)

---

## 1. Health & Diagnostics

### `GET /api/health`
- **Auth Required**: No
- **Description**: Returns database connection status and server health.
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "environment": "development",
    "timestamp": "2026-08-20T21:49:00.000Z"
  }
}
```
- **Error Response (503 Service Unavailable)**: Database disconnected.

---

## 2. Authentication

### `POST /api/auth/register`
- **Auth Required**: No
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "6a872...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```
- **Validation & Security Rules**: Email is normalized (lowercase & trimmed). Duplicate emails return `400 Bad Request`. Passwords are hashed with bcrypt (salt rounds = 10) and never returned.

### `POST /api/auth/login`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "6a872...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```
- **Security Rules**: Returns generic `401 Unauthorized` ("Invalid credentials") for wrong passwords or non-existent emails without revealing email existence.

### `GET /api/auth/me`
- **Auth Required**: Yes (`Bearer <token>`)
- **Success Response (200 OK)**: Returns current authenticated user object.

### `POST /api/auth/logout`
- **Auth Required**: Yes
- **Success Response (200 OK)**: `{"message": "Logged out successfully"}`.

---

## 3. User Management

### `GET /api/users/me`
- **Auth Required**: Yes
- **Success Response (200 OK)**: Returns profile object for current user.

### `PATCH /api/users/me`
- **Auth Required**: Yes
- **Request Body**: `{"name": "Updated Name"}`
- **Success Response (200 OK)**: Returns updated user profile. Sanitizes/strips `email`, `passwordHash`, `_id`, `role`.

### `PATCH /api/users/me/password`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```
- **Success Response (200 OK)**: `{"message": "Password updated successfully"}`.

### `DELETE /api/users/me`
- **Auth Required**: Yes
- **Request Body**: `{"password": "password123"}`
- **Success Response (200 OK)**: `{"message": "User account and associated data deleted"}`. Cascades deletion to user's experiments, progress, quiz attempts, and Mini OS data.

---

## 4. Simulations Engine

### CPU Scheduling
- **Endpoints**:
  - `POST /api/simulations/scheduling/fcfs`
  - `POST /api/simulations/scheduling/sjf`
  - `POST /api/simulations/scheduling/srtf`
  - `POST /api/simulations/scheduling/round-robin` (requires `timeQuantum`)
  - `POST /api/simulations/scheduling/priority` (requires `isPreemptive`)
- **Auth Required**: Optional / Stateless
- **Input Example**:
```json
{
  "processes": [
    { "pid": "P1", "arrivalTime": 0, "burstTime": 5, "priority": 1 },
    { "pid": "P2", "arrivalTime": 1, "burstTime": 3, "priority": 2 }
  ]
}
```
- **Output**: Returns `processes` (completion/turnaround/waiting/response times), `ganttChart`, and `metrics` (averages, utilization, throughput).

### Memory Allocation
- **Endpoints**:
  - `POST /api/simulations/memory/first-fit`
  - `POST /api/simulations/memory/best-fit`
  - `POST /api/simulations/memory/worst-fit`
  - `POST /api/simulations/memory/next-fit`
- **Input Example**:
```json
{
  "blocks": [{ "id": "B1", "size": 100 }, { "id": "B2", "size": 500 }],
  "processes": [{ "id": "P1", "size": 212 }, { "id": "P2", "size": 417 }]
}
```
- **Output**: Returns process allocations, final block states, and internal/external fragmentation metrics.

### Page Replacement
- **Endpoints**:
  - `POST /api/simulations/paging/fifo`
  - `POST /api/simulations/paging/lru`
  - `POST /api/simulations/paging/optimal`
- **Input Example**:
```json
{
  "referenceString": [7, 0, 1, 2, 0, 3, 0, 4],
  "frameCount": 3
}
```
- **Output**: Returns step-by-step frame contents, page hit/fault metrics, and hit/fault ratios.

### Disk Scheduling
- **Endpoints**:
  - `POST /api/simulations/disk/fcfs`
  - `POST /api/simulations/disk/sstf`
  - `POST /api/simulations/disk/scan` (requires `direction`)
  - `POST /api/simulations/disk/cscan` (requires `direction`)
  - `POST /api/simulations/disk/look` (requires `direction`)
  - `POST /api/simulations/disk/clook` (requires `direction`)
- **Input Example**:
```json
{
  "requests": [98, 183, 37, 122, 14, 124, 65, 67],
  "initialHead": 53,
  "diskSize": 200,
  "direction": "right"
}
```
- **Output**: Returns service sequence, movement steps (`from`, `to`, `distance`, `type`), `totalHeadMovement`, and `averageSeekDistance`. Valid cylinders: $0 \le \text{cylinder} < \text{diskSize}$.

---

## 5. Experiment Persistence

### `POST /api/experiments`
- **Auth Required**: Yes
- **Request Body**: `{"type": "disk", "algorithm": "sstf", "input": {...}, "results": {...}}`
- **Success Response (201 Created)**: Saved experiment object. Client attempts to pass `userId` or `_id` are stripped.

### `GET /api/experiments`
- **Auth Required**: Yes
- **Query Params**: `?type=disk&algorithm=sstf&page=1&limit=20`
- **Success Response (200 OK)**: Array of user experiments (or paginated result if `page`/`limit` supplied).

### `GET /api/experiments/:id`
- **Auth Required**: Yes
- **Success Response (200 OK)**: Experiment document if owned by user. Unauthorized or nonexistent access returns `404 Not Found`.

### `DELETE /api/experiments/:id`
- **Auth Required**: Yes
- **Success Response (200 OK)**: `{"message": "Experiment deleted"}`. Unauthorized deletion returns `404 Not Found`.

---

## 6. Learning Progress

### `POST /api/progress`
- **Auth Required**: Yes
- **Request Body**: `{"topic": "cpu-scheduling", "completionPercentage": 100}`
- **Success Response (200 OK)**: Upserts user progress for topic (`userId` + `topic` compound unique index).

### `GET /api/progress`
- **Auth Required**: Yes
- **Success Response (200 OK)**: List of user topic progress records.

### `GET /api/progress/:topic`
- **Auth Required**: Yes
- **Success Response (200 OK)**: Progress record for specific topic.

---

## 7. Quiz & Assessment Engine

### `GET /api/quizzes/:topic`
- **Auth Required**: Yes
- **Query Params**: `?limit=10`
- **Success Response (200 OK)**: Array of public questions for topic. **Excludes `correctAnswer` and `explanation`**.

### `POST /api/quizzes/:topic/submit`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "answers": [
    { "questionId": "6a872...", "answer": 2 }
  ]
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "score": 5,
    "maxScore": 5,
    "percentage": 100,
    "correct": 5,
    "incorrect": 0,
    "attempted": 5,
    "passed": true,
    "attemptId": "6a873...",
    "topic": "cpu-scheduling"
  }
}
```
- **Security Rules**: Server calculates grade 100% server-side. Scores or statuses sent in client payload are stripped. Updates `LearningProgress` on passing ($\ge 60\%$). Failed quizzes preserve existing progress.

### `GET /api/quizzes/history`
- **Auth Required**: Yes
- **Query Params**: `?topic=cpu-scheduling&page=1&limit=20`
- **Success Response (200 OK)**: Paginated array of current user's quiz attempts.

### `GET /api/quizzes/attempts/:id`
- **Auth Required**: Yes
- **Success Response (200 OK)**: Quiz attempt details for owner. Cross-user access returns `404 Not Found`.

---

## 8. Dashboard & Analytics

### `GET /api/dashboard`
- **Auth Required**: Yes
- **Description**: Returns aggregated metrics for the authenticated user.
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "overallProgress": 18.8,
      "topicsCompleted": 1,
      "totalTopics": 8,
      "experimentsCompleted": 3,
      "quizzesTaken": 1,
      "averageQuizPercentage": 60,
      "bestQuizPercentage": 60
    },
    "topics": [...],
    "quiz": {...},
    "experiments": {...},
    "popularAlgorithms": [...],
    "recentActivity": [...]
  }
}
```
- **Security & Performance**: Queries strictly scoped to `req.user.userId`. Uses parallel queries with projections (`Promise.all()`). Unvisited topics default to 0%.

---

## 9. Mini OS Educational Runtime

### `POST /api/mini-os/processes`
- **Auth Required**: Yes
- **Request Body**: `{"name": "Process A", "burstTime": 10, "priority": 5}`
- **Success Response (201 Created)**: Creates process with per-user auto-incremented PID (starting at 1) and initial state `'NEW'`.

### `GET /api/mini-os/processes`
- **Auth Required**: Yes
- **Query Params**: `?state=READY`
- **Success Response (200 OK)**: List of user processes.

### `GET /api/mini-os/processes/:pid`
- **Auth Required**: Yes
- **Success Response (200 OK)**: Process details. Cross-user access returns `404 Not Found`.

### Process State Transitions:
- `POST /api/mini-os/processes/:pid/ready` (`NEW`/`WAITING` $\rightarrow$ `READY`)
- `POST /api/mini-os/processes/:pid/run` (`READY` $\rightarrow$ `RUNNING`)
- `POST /api/mini-os/processes/:pid/wait` (`RUNNING` $\rightarrow$ `WAITING`)
- `POST /api/mini-os/processes/:pid/terminate` (`RUNNING`/`READY` $\rightarrow$ `TERMINATED`)
- **Rule**: Invalid state transitions return `400 Bad Request`.

### `POST /api/mini-os/processes/:pid/tick`
- **Auth Required**: Yes
- **Success Response (200 OK)**: CPU execution unit. Decrements `remainingTime` by 1 only when state is `'RUNNING'`. Auto-terminates process when `remainingTime <= 0`.

### Memory Management:
- `GET /api/mini-os/memory` — Returns memory state (`totalMemory: 1024`, unit: `"MB"`).
- `POST /api/mini-os/memory/allocate` — Request body `{"pid": 1, "size": 200}`. Allocates memory in MB if available.
- `POST /api/mini-os/memory/free` — Request body `{"pid": 1}`. Frees memory allocated to process PID.

### Virtual File System:
- `POST /api/mini-os/files` — Request body `{"name": "test.txt", "content": "hello"}`. UTF-8 byte size computed server-side.
- `GET /api/mini-os/files` — List user virtual files.
- `GET /api/mini-os/files/:id` — Get virtual file details.
- `PATCH /api/mini-os/files/:id` — Update virtual file name or content.
- `DELETE /api/mini-os/files/:id` — Delete virtual file.

### Consolidated Snapshot & Reset:
- `GET /api/mini-os/state` — Returns full Mini OS state snapshot (processes, memory state, files, statistics).
- `POST /api/mini-os/reset` — Clears Mini OS processes, memory allocations, and files for current user. Leaves experiments, progress, and quiz history untouched.
