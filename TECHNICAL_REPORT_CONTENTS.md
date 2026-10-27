# VECTOR - AI Resume Intelligence & Analyzer

## Technical Report Contents and Writing Guide

> This document is a project-specific contents page and writing guide for preparing
> a complete technical report. Each section includes the points that should be
> explained, the relevant implementation area, and the evidence that can be
> included in the final report.

## 1. Abstract

Summarize the system in one or two paragraphs:

- VECTOR is an AI-assisted resume analysis, job matching, career recommendation,
  and resume improvement platform.
- Users can upload resumes in PDF, PNG, JPG, or JPEG format.
- The system extracts text and structured resume information, scores the resume,
  finds relevant jobs, identifies skill gaps, explains recommendations, and
  provides AI career assistance.
- The application uses a React/TypeScript frontend, a FastAPI/Python backend,
  SQLite for application records, ChromaDB for vector search, and optional
  Gemini/Ollama language-model providers.

## 2. Introduction

### 2.1 Background

Explain the difficulty of manually tailoring resumes to individual job
descriptions and the need for automated, explainable career assistance.

### 2.2 Problem Statement

Describe the problem addressed by the project:

- Resume information is usually unstructured.
- Candidates may not know which skills are missing for a target role.
- Conventional keyword matching does not capture semantic similarity.
- Resume feedback and job recommendations are often disconnected.

### 2.3 Proposed Solution

Describe VECTOR as an integrated workflow that combines document processing,
rule-based extraction, NLP, embeddings, vector retrieval, scoring, and
language-model assistance.

### 2.4 Objectives

Document the objectives:

1. Accept and process resumes from multiple document formats.
2. Extract readable text, sections, entities, skills, education, experience,
   projects, and certifications.
3. Store processed resumes and jobs for later use.
4. Match resumes with semantically relevant jobs.
5. Quantify resume quality and job compatibility.
6. Identify matched and missing skills.
7. Explain recommendations in a user-understandable way.
8. Provide actionable AI-generated resume and career guidance.

### 2.5 Scope

State what is included:

- Resume upload and document preview.
- Resume parsing, extraction, scoring, and persistence.
- Job creation, processing, storage, and vector indexing.
- Resume-to-job matching and match history.
- Skill-gap analysis and recommendations.
- Explainability, career chat, and resume improvement.
- Dashboard-based frontend experience.

Also state what is outside the current scope or should be treated as future work:

- Authentication and multi-user authorization.
- Production-scale distributed storage.
- Formal model training on a labeled dataset.
- Guaranteed correctness of extracted resume fields.
- Human resources decision automation.

## 3. Existing System and Motivation

Compare the proposed system with common approaches:

- Manual resume review.
- Keyword-only applicant tracking systems.
- Separate resume builders and job boards.
- Generic chatbots that do not ground answers in a candidate resume.

Explain why semantic search, structured extraction, score breakdowns, and
explainability improve the candidate experience.

## 4. System Requirements

### 4.1 Functional Requirements

Describe the required capabilities:

- Upload, list, inspect, update, preview, and delete resumes.
- Parse PDF text and OCR image-based resumes.
- Detect resume sections and normalize skills.
- Calculate resume quality scores.
- Create, list, process, and delete jobs.
- Index jobs and search them with vector similarity.
- Match a resume against jobs and record match results.
- Calculate skill gaps.
- Generate recommendations and job explanations.
- Maintain career-chat history.
- Generate targeted resume improvement suggestions.
- Configure and report the status of AI providers.

### 4.2 Non-Functional Requirements

Discuss:

- Usability through a dashboard interface.
- API interoperability through REST and JSON.
- Type safety in the TypeScript frontend and Pydantic request/response models.
- Persistence across application restarts.
- Local-first operation through SQLite, ChromaDB, and optional Ollama.
- Extensibility through separate API and service modules.
- Error responses for unsupported files, missing records, and unreadable
  documents.

### 4.3 Hardware and Software Requirements

Document the development requirements:

- Python 3.10 or newer, with Python 3.10-3.13 recommended in the existing
  project documentation.
- Node.js 18 or newer and npm.
- spaCy `en_core_web_sm` model.
- Optional Ollama installation with the configured local model.
- Optional Gemini API key.
- Sufficient disk space for the embedding model, OCR dependencies, and vector
  database.

## 5. High-Level System Architecture

### 5.1 Architecture Overview

Include a diagram with these layers:

```text
User
  |
  v
React + TypeScript + Vite Dashboard
  |
  | REST/JSON and multipart upload
  v
FastAPI Application
  |
  +-- Resume and job API routers
  +-- Matching, recommendation, skill-gap, and explainability APIs
  +-- Career chat and resume-improvement APIs
  |
  +-- Document extraction and NLP services
  +-- Scoring and matching services
  +-- AI provider service
  |
  +-- SQLite (resumes, jobs, matches, settings)
  +-- ChromaDB (job embeddings and metadata)
  +-- File storage (uploaded documents)
  +-- Gemini or Ollama (optional language-model generation)
```

### 5.2 Backend Architecture

Explain the backend organization:

- `backend/app/main.py`: FastAPI application entry point, startup database
  initialization, CORS, and router registration.
- `backend/app/api/`: HTTP route controllers.
- `backend/app/services/`: extraction, NLP, scoring, matching, recommendation,
  vector, and AI business logic.
- `backend/app/schemas/`: Pydantic request and response schemas.
- `backend/app/db/`: SQLite connection, schema initialization, persistence,
  seeding, and record formatting.
- `backend/app/utils/`: shared text-processing helpers.
- `backend/uploads/`: uploaded source documents.

### 5.3 Frontend Architecture

Explain:

- React pages and reusable components.
- React Router route structure.
- Zustand stores for application, resume, job, and analysis state.
- API wrappers under `frontend/src/api/`.
- Service modules under `frontend/src/services/`.
- TypeScript types under `frontend/src/types/`.
- Tailwind CSS styling and shared UI components.
- Optional mock mode controlled by `VITE_USE_MOCKS`.

## 6. End-to-End Data Flow

### 6.1 Resume Upload and Processing Flow

Describe this sequence in detail:

1. The user selects a PDF or image in the frontend upload interface.
2. The frontend sends a multipart request to `POST /resume/upload`.
3. The backend validates the extension and stores the uploaded file with a
   unique filename.
4. PyMuPDF extracts text from PDFs.
5. EasyOCR extracts text from PNG/JPG/JPEG files; image uploads also receive a
   PDF preview when conversion succeeds.
6. The extracted text is cleaned.
7. Sections such as personal information, education, skills, experience,
   projects, and certifications are detected.
8. Entities, candidate name, role, experience years, and normalized skills are
   extracted.
9. A deterministic resume score and category breakdown are calculated.
10. The raw text, sections, structured data, metadata, and file path are saved
    in SQLite.
11. The processed resume is returned to the frontend for display.

### 6.2 Job Ingestion and Indexing Flow

Explain:

1. A job is submitted through the frontend or the job API.
2. Missing required skills and experience values can be inferred from the
   description.
3. The job is saved in SQLite.
4. Job title, description, and skills are converted into a single text payload.
5. `all-MiniLM-L6-v2` generates the job embedding.
6. The embedding, document, and metadata are upserted into the ChromaDB
   `jobs` collection.
7. The initial jobs dataset can seed SQLite during database initialization.

### 6.3 Resume-to-Job Matching Flow

Explain:

1. The resume text is embedded with the same sentence-transformer model.
2. ChromaDB performs nearest-neighbor search over indexed jobs.
3. Chroma distances are converted into a similarity-style percentage using the
   implemented formula.
4. Job metadata, required skills, experience requirements, and similarity score
   are returned.
5. If vector search cannot produce results, the implementation uses the local
   jobs dataset fallback.
6. Match records can be persisted in SQLite for history and candidate ranking.

### 6.4 Skill-Gap Flow

Document the case-insensitive set comparison:

- Candidate skills are normalized by lowercasing and trimming.
- Required skills are normalized in the same way.
- The intersection is returned as matched skills.
- Required skills absent from the candidate set are returned as missing skills.
- Skill-match percentage is calculated as matched required skills divided by
  total required skills.

### 6.5 AI Assistance Flow

Describe the provider selection:

1. Gemini is attempted when an API key is configured.
2. Ollama is attempted when available locally.
3. The system falls back to a heuristic answer generator if model generation is
   unavailable.
4. Career-chat messages are stored by session ID.
5. Resume-improvement prompts include the resume, target role, job description,
   candidate skills, and missing skills.

Mention that generated advice should be treated as assistance requiring human
review, not as a guaranteed factual or hiring decision.

## 7. Detailed Backend Modules

Describe the responsibility and inputs/outputs of:

- `resume.py`: upload, retrieval, update, preview, and deletion endpoints.
- `job.py`: job CRUD, job processing, and vector indexing.
- `matching.py`: resume matching and persisted match history.
- `skill_gap.py`: deterministic skill comparison.
- `recommendation.py`: job matching followed by recommendation ranking.
- `explainability.py`: explanation of job fit.
- `chat.py`: provider status, AI configuration, career chat, and history reset.
- `resume_improvement.py`: structured resume improvement suggestions.
- `embedding.py` and `vector.py`: embedding and vector operations.
- `ingestion.py`: batch or dataset job ingestion.

## 8. NLP, OCR, and Information Extraction

### 8.1 Text Extraction

Explain PyMuPDF text extraction for PDFs and EasyOCR for image resumes.

### 8.2 Section Detection

Document how cleaned text is divided into resume sections and how those
sections feed downstream extractors.

### 8.3 Entity and Metadata Extraction

Explain entity extraction for names and other resume information, role
inference from leading text, and experience-year extraction.

### 8.4 Skill Extraction and Normalization

Distinguish between skills extracted from the skills section and normalized
skills found across the resume.

### 8.5 Limitations

Discuss OCR quality, unusual layouts, tables, multi-column resumes, synonyms,
misspellings, and the possibility of incorrect section boundaries or inferred
metadata.

## 9. Scoring and Recommendation Logic

### 9.1 Resume Quality Score

Document the current maximum 100-point heuristic:

| Category | Maximum |
|---|---:|
| Skills | 25 |
| Experience | 25 |
| Education | 15 |
| Projects | 15 |
| Certifications | 10 |
| **Total** | **90** |

Explain the implemented thresholds and note that the function caps the final
value at 100; the currently defined category maximums total 90, so this should
be clearly described as the current implementation rather than a normalized
100-point rubric.

### 9.2 Job Similarity

Explain sentence-transformer embeddings, ChromaDB nearest-neighbor retrieval,
distance-to-score conversion, and the fallback behavior.

### 9.3 Candidate-to-Job Score

For persisted candidate ranking, document the weighted heuristic:

- 70% skill-match percentage.
- 30% experience score.
- Final value constrained to the range 0-100.

### 9.4 Recommendation and Explanation

Explain how retrieved jobs are further ranked using candidate skills and
experience, and how matched/missing skills are used to make the result
understandable.

## 10. Data Storage and Data Model

### 10.1 SQLite Tables

Document the tables initialized by the backend:

- `resumes`: uploaded file metadata, extracted text, sections, skills,
  structured data, score-related data, and file path.
- `jobs`: job title, company, location, description, required skills,
  experience requirement, and match count.
- `matches`: candidate/job relationship, score, matched skills, missing skills,
  and timestamp.
- `settings`: persisted runtime configuration such as the Gemini API key.

### 10.2 ChromaDB Collection

Document the persistent `jobs` collection:

- ID: job ID.
- Document: combined job title, description, and skill text.
- Embedding: sentence-transformer vector.
- Metadata: title, company, location, required skills, and experience.

### 10.3 File Storage

Explain that uploaded files are kept under `backend/uploads/`, while the
database stores the path used for preview and retrieval.

### 10.4 Data Privacy and Retention

The report should explicitly discuss that resumes contain personal data,
uploaded files and extracted text are persisted locally, API keys can be
persisted in settings/environment configuration, and production deployments
need encryption, access control, retention rules, and secret management.

## 11. API Reference

Include request fields, response shapes, status codes, and example requests for
the following endpoint groups:

| Group | Main endpoints |
|---|---|
| Health | `GET /` |
| Resumes | `POST /resume/upload`, `GET /resume/`, `GET /resume/{id}`, `GET /resume/{id}/pdf`, `PUT /resume/{id}`, `DELETE /resume/{id}` |
| Jobs | `GET /jobs/`, `GET /jobs/{id}`, `POST /jobs/`, `POST /jobs/process`, `DELETE /jobs/{id}` |
| Matching | `POST /matching/resume-jobs`, `GET /matching/recent`, `POST /matching/record`, `GET /matching/job/{id}` |
| Embeddings and vectors | Endpoints defined in `backend/app/api/embedding.py` and `backend/app/api/vector.py` |
| Skill gaps | `POST /skill-gap/analyze` |
| Recommendations | `POST /recommendations/resume` |
| Explainability | `POST /explain/job` |
| Chat | `GET /chat/status`, `POST /chat/config`, `POST /chat/career`, `DELETE /chat/career/{session_id}` |
| Resume improvement | `POST /resume/improve` |
| Ingestion | `POST /ingestion/jobs` |

The final report should use the automatically generated Swagger documentation at
`http://127.0.0.1:8000/docs` to confirm exact schemas and status codes.

## 12. Frontend User Experience

Describe the user-facing pages and workflows:

- Overview dashboard with statistics, recent matches, and activity signals.
- Resume list, upload zone, resume details, extraction panel, and document
  viewer.
- Job list and job creation/processing workflow.
- Match results and score presentation.
- Analysis Studio with score breakdown, skill signals, and explainability.
- Recommendations and resume-improvement workspace.
- Career chat interface with suggested prompts and message history.
- Settings page for AI configuration and provider status.
- Shared navigation, tables, dialogs, notifications, loading states, and
  responsive mobile navigation.

## 13. Installation and Execution

Document the reproducible setup:

### 13.1 Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python run_server.py
```

### 13.2 Optional AI Provider

Explain how to configure either:

- Ollama with the configured local model; or
- a Gemini API key through the supported configuration flow/environment.

Do not include real API keys in the report or repository.

### 13.3 Frontend

```powershell
cd frontend
npm install
npm run dev
```

Document:

- `VITE_API_BASE_URL`: backend URL.
- `VITE_USE_MOCKS`: whether the frontend uses mock data instead of the live
  backend.

## 14. Testing and Validation Strategy

Include:

- Backend API tests with pytest and HTTPX.
- Upload tests for valid formats, unsupported extensions, unreadable files, and
  missing records.
- NLP tests for section detection, skills, entities, and experience extraction.
- Scoring tests covering empty, partial, and complete resumes.
- Skill-gap tests covering case differences, duplicates, and empty requirements.
- Vector matching tests with indexed jobs and empty-collection behavior.
- Frontend build and lint checks.
- End-to-end manual test: upload resume -> inspect extraction -> match jobs ->
  review gaps -> open explanation -> request improvement -> use career chat.
- Test behavior with Gemini unavailable and Ollama unavailable to verify the
  documented fallback.

## 15. Security, Privacy, and Reliability Considerations

Discuss:

- File-type validation and upload size limits that should be enforced for
  production use.
- CORS configuration and production origin restriction.
- Authentication and authorization requirements.
- Secure handling of resume PII and API keys.
- Prompt/data leakage risks when sending resume content to external AI APIs.
- Input validation and output validation for model-generated content.
- Cleanup of temporary uploads and retention policy.
- Error handling when OCR, embeddings, vector indexing, or AI providers fail.
- Backup and recovery for SQLite and ChromaDB.
- Monitoring, rate limiting, audit logs, and request timeouts.

## 16. Results and Demonstration

Provide a reproducible demonstration using:

1. A sample resume.
2. One or more seeded or newly created jobs.
3. Extracted candidate information.
4. Resume score and category breakdown.
5. Top matching jobs and similarity values.
6. Matched and missing skills.
7. Explanation output.
8. Resume-improvement suggestions.
9. Career-chat response.

Include screenshots of the dashboard and tables of representative API
responses. Remove or anonymize all personal information.

## 17. Limitations

Be explicit about:

- Heuristic rather than learned resume scoring.
- Skill matching that may be sensitive to naming and normalization quality.
- Embedding similarity not being the same as actual candidate qualification.
- OCR and layout parsing errors.
- Optional AI provider availability and model variability.
- Local SQLite/ChromaDB suitability for development or small deployments rather
  than high-concurrency production.
- No authentication or role-based access control in the current application.
- No guarantee that generated suggestions are factually correct or safe to
  submit without review.

## 18. Future Enhancements

Propose:

- User accounts, authentication, and role-based access.
- PostgreSQL or another production database.
- Managed vector storage and background job processing.
- Better resume layout parsing and multilingual OCR/NLP.
- Skill ontology, synonym mapping, and taxonomy-based matching.
- Calibrated scoring learned from labeled hiring outcomes.
- Evaluation datasets and precision/recall metrics for extraction and matching.
- Streaming AI responses and provider-independent model adapters.
- Versioned resume edits and export to PDF/DOCX.
- Admin controls, analytics, monitoring, and audit trails.
- Automated deployment with containers and CI/CD.

## 19. Conclusion

Conclude by explaining how VECTOR combines document intelligence, semantic
retrieval, deterministic scoring, and optional generative AI into one workflow
for resume analysis and career guidance. Reiterate the practical value while
distinguishing the current prototype/development implementation from a
production hiring system.

## 20. Appendices

Suggested appendices:

- Complete directory structure.
- API request/response examples.
- Database schema.
- ChromaDB metadata example.
- Resume-processing sequence diagram.
- Job-matching sequence diagram.
- Environment variable reference.
- Installation commands.
- Test cases and results.
- Screenshots.
- Glossary: OCR, NLP, embedding, vector database, RAG, LLM, similarity score,
  skill gap, and explainability.

