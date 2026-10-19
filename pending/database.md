# Database Architecture & Persistence Documentation

## 1. Overview

The AI Resume Analyzer application uses a persistent **SQLite relational database** (`backend/data/resumes.db`) paired with **ChromaDB** (`vector_db/`) for vector embeddings.

This eliminates temporary in-memory or browser `localStorage` fallbacks (`sessionJobs`, `sessionMatches`), providing true persistence across sessions, browsers, and devices.

---

## 2. SQLite Database Schema (`backend/data/resumes.db`)

All tables are defined and automatically initialized on startup via `init_db()` in [`backend/app/db/database.py`](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/backend/app/db/database.py).

### A. `resumes` Table
Stores parsed resume data, extracted skills, candidate information, and file paths.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique identifier (e.g. `res_real_1718000000`) |
| `filename` | TEXT | NOT NULL | Original uploaded filename (PDF, PNG, JPG, JPEG) |
| `candidate_name`| TEXT | | Detected candidate name |
| `role` | TEXT | | Detected current/target role |
| `experience_years`| REAL | DEFAULT 0.0 | Explicit years of experience extracted |
| `status` | TEXT | DEFAULT 'ready' | Processing status (`ready`, `processing`, `failed`) |
| `skills` | TEXT | JSON | List of normalized extracted skills |
| `raw_text` | TEXT | | Cleaned text extracted via PyMuPDF or EasyOCR |
| `sections` | TEXT | JSON | Dictionary of detected resume sections |
| `structured_data` | TEXT | JSON | Deep structured data (education, projects, etc.) |
| `file_path` | TEXT | | Absolute path to uploaded file on disk |
| `uploaded_at` | TEXT | ISO-8601 | UTC timestamp of upload |

---

### B. `jobs` Table
Stores job descriptions, role requirements, and target skills. Automatically seeded from `data/jobs/jobs.json` on initial database setup.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique identifier (e.g. `JOB001`, `job_1718000000`) |
| `title` | TEXT | NOT NULL | Job title |
| `role` | TEXT | | Role designation |
| `company` | TEXT | | Hiring company |
| `location` | TEXT | | Job location / Remote |
| `description` | TEXT | | Full job description text |
| `required_skills` | TEXT | JSON | Extracted list of mandatory/preferred skills |
| `experience_required` | REAL | DEFAULT 0.0 | Minimum years of experience required |
| `matches_count` | INTEGER | DEFAULT 0 | Counter incremented whenever matched against candidates |
| `added_at` | TEXT | ISO-8601 | UTC creation timestamp |

---

### C. `matches` Table
Maintains persistent audit logs and evaluation history between candidates and job positions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique identifier (e.g. `match_1718000000`) |
| `candidate_id` | TEXT | NOT NULL | Foreign reference to `resumes.id` |
| `candidate_name` | TEXT | | Candidate display name |
| `job_id` | TEXT | NOT NULL | Foreign reference to `jobs.id` |
| `job_title` | TEXT | | Position title |
| `score` | INTEGER | NOT NULL | Calculated match score (0 - 100) |
| `matched_skills` | TEXT | JSON | Skills overlapping between candidate and job |
| `missing_skills` | TEXT | JSON | Required skills absent from candidate profile |
| `timestamp` | TEXT | ISO-8601 | UTC match run timestamp |

---

### D. `settings` Table
Key-value storage for application-level settings and configuration.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `key` | TEXT | PRIMARY KEY | Configuration key name |
| `value` | TEXT | | Configuration value |

---

## 3. ChromaDB Vector Store (`vector_db/`)

- Collection: `jobs`
- Embedding Model: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors)
- Document Text: Formatted role title, description, and required skills
- Metadata: `title`, `company`, `location`, `required_skills`, `experience_required`
- Synchronization: When a job is added via `POST /jobs/`, it is automatically embedded and indexed in ChromaDB. When deleted via `DELETE /jobs/{id}`, it is removed from ChromaDB.

---

## 4. API Endpoints Reference

### Resumes (`/resume`)
- `POST /resume/upload`: Upload PDF, PNG, JPG, or JPEG file. Runs OCR if image, extracts entities/skills, saves to SQLite `resumes` table, and returns parsed resume record.
- `GET /resume/`: Returns list of all persisted resumes from SQLite.
- `GET /resume/{id}`: Returns single resume by ID.
- `PUT /resume/{id}`: Updates candidate information, skills, or sections in SQLite.
- `DELETE /resume/{id}`: Deletes resume record from SQLite and removes associated uploaded files from disk.
- `GET /resume/{id}/pdf`: Streams original document or on-the-fly converted PDF for preview in the frontend DocumentViewer.

### Jobs (`/jobs`)
- `GET /jobs/`: Returns all jobs from SQLite `jobs` table (including seeded default jobs).
- `GET /jobs/{id}`: Returns a single job record.
- `POST /jobs/`: Creates a new job. Auto-extracts required skills & experience via NLP if not provided, persists in SQLite, and indexes in ChromaDB.
- `DELETE /jobs/{id}`: Deletes job from SQLite and ChromaDB.
- `POST /jobs/process`: In-memory skill extraction for preview.

### Matching & History (`/matching`)
- `GET /matching/recent`: Retrieves recent match history records from SQLite for the Overview dashboard.
- `POST /matching/record`: Records an evaluated candidate-job match to SQLite and increments the job's `matches_count`.
- `GET /matching/job/{job_id}`: Evaluates candidates in the database against the job's requirements and returns ranked candidates.
- `POST /matching/resume-jobs`: Performs semantic vector search in ChromaDB using resume text embedding.

---

## 5. Frontend Service Integration

- [`frontend/src/api/job.api.ts`](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/frontend/src/api/job.api.ts) & [`frontend/src/services/job.service.ts`](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/frontend/src/services/job.service.ts):
  - Directly queries `GET /jobs/`, `POST /jobs/`, and `DELETE /jobs/{id}`.
- [`frontend/src/api/matching.api.ts`](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/frontend/src/api/matching.api.ts) & [`frontend/src/services/matching.service.ts`](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/frontend/src/services/matching.service.ts):
  - Fetches recent match history via `GET /matching/recent`.
  - Persists match evaluations via `POST /matching/record`.
  - Displays ranked candidate lists in `MatchResultsPage.tsx` via `GET /matching/job/{job_id}`.
