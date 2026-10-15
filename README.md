# VECTOR — AI Resume Intelligence & Analyzer

An intelligent AI-powered resume analysis, job matching, and career recommendation system supporting **PDF, PNG, JPG, and JPEG** resumes. Built with **FastAPI** on the backend and **React + TypeScript + Vite** on the frontend.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start Summary](#quick-start-summary)
- [Backend Setup & Running](#backend-setup--running)
  - [1. Navigate to backend](#1-navigate-to-backend)
  - [2. Virtual Environment Setup](#2-virtual-environment-setup)
  - [3. Install Dependencies](#3-install-dependencies)
  - [4. Download spaCy NLP Model](#4-download-spacy-nlp-model)
  - [5. Setup Ollama (AI Chat & Improvement)](#5-setup-ollama-ai-chat--improvement)
  - [6. Start Backend Server](#6-start-backend-server)
  - [7. Verify Backend](#7-verify-backend)
- [Frontend Setup & Running](#frontend-setup--running)
  - [1. Navigate to frontend](#1-navigate-to-frontend)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Environment Configuration](#3-environment-configuration)
  - [4. Start Frontend Dev Server](#4-start-frontend-dev-server)
  - [5. Other Frontend Scripts](#5-other-frontend-scripts)
- [Project Architecture & Directory Structure](#project-architecture--directory-structure)
- [Troubleshooting & Common Issues](#troubleshooting--common-issues)

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Python**: Version `3.10` or higher (Python 3.10 - 3.13 recommended)
- **Node.js**: Version `18.x` or higher (LTS recommended) and **npm**
- **Ollama**: (Optional for basic parsing, recommended for AI career chat & resume improvement) — [Download Ollama](https://ollama.com)

---

## Quick Start Summary

Open two separate terminal windows:

### Terminal 1 (Backend)
```bash
cd backend
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm
python run_server.py
```
> Running at: **`http://127.0.0.1:8000`** | Swagger Docs: **`http://127.0.0.1:8000/docs`**

### Terminal 2 (Frontend)
```bash
cd frontend
npm install
npm run dev
```
> Running at: **`http://localhost:5173`**

---

## Backend Setup & Running

The backend is built with FastAPI, PyMuPDF, spaCy, Sentence-Transformers, ChromaDB, and Ollama.

### 1. Navigate to backend
```bash
cd backend
```

### 2. Virtual Environment Setup

Create and activate an isolated Python virtual environment:

- **Windows (PowerShell)**:
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
  *(If execution of scripts is restricted in PowerShell, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first)*

- **Windows (Command Prompt)**:
  ```cmd
  python -m venv venv
  venv\Scripts\activate.bat
  ```

- **macOS / Linux**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Download spaCy NLP Model
The resume extraction service uses spaCy's `en_core_web_sm` model for entity recognition (names, organizations, locations, etc.):
```bash
python -m spacy download en_core_web_sm
```

### 5. Setup Ollama (AI Chat & Improvement)
The interactive chat assistant and resume improvement features communicate with a local LLM via Ollama.
1. Download and install [Ollama](https://ollama.com).
2. Start the Ollama desktop service or run:
   ```bash
   ollama serve
   ```
3. Pull the required model:
   ```bash
   ollama pull llama3.2:3b
   ```

### 6. Start Backend Server

You can run the backend server using the provided runner script (which includes compatibility configurations for protobuf):

```bash
python run_server.py
```

*Alternatively, you can start with Uvicorn directly:*
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 7. Verify Backend
- **Root Health Check**: Open [http://127.0.0.1:8000](http://127.0.0.1:8000) (Should return status message)
- **Interactive API Documentation (Swagger)**: Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative ReDoc Documentation**: Open [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## Frontend Setup & Running

The frontend is a modern dashboard built with React 19, TypeScript, Vite, Tailwind CSS, Zustand, and TanStack Query.

### 1. Navigate to frontend
Open a new terminal window and navigate to the `frontend` folder:
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Verify that `frontend/.env` exists and points to your backend server:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCKS=false
```
> If you want to test the frontend UI without running the backend, set `VITE_USE_MOCKS=true`.

### 4. Start Frontend Dev Server
```bash
npm run dev
```

Open your browser and navigate to:
**[http://localhost:5173](http://localhost:5173)**

### 5. Other Frontend Scripts
- **Build for Production**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```
- **Lint Code**:
  ```bash
  npm run lint
  ```

---

## Project Architecture & Directory Structure

```plaintext
AI-Resume-Analyzer/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI route controllers (resume, job, matching, chat, etc.)
│   │   ├── models/          # Schemas and data models
│   │   ├── services/        # Business logic (nlp_extractor, vector_db, llm_service, etc.)
│   │   ├── utils/           # Helper functions
│   │   └── main.py          # FastAPI application entrypoint & CORS configuration
│   ├── requirements.txt     # Python dependencies
│   ├── run_server.py        # Server runner with environment overrides
│   └── uploads/             # Temporary uploaded resume PDF storage
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (analysis, chat, job, improvement, shared)
│   │   ├── pages/           # Application views (Dashboard, Resumes, Jobs, Match, Chat, etc.)
│   │   ├── services/        # API clients & services (Axios / mock data fallbacks)
│   │   └── store/           # Zustand state management stores
│   ├── package.json         # Frontend dependencies and npm scripts
│   ├── vite.config.ts       # Vite configuration with '@/' path alias
│   └── tailwind.config.ts   # Design tokens & color system
├── vector_db/               # Persistent ChromaDB vector database files
└── README.md                # Project documentation
```

---

## Troubleshooting & Common Issues

### 1. `OSError: [E050] Can't find model 'en_core_web_sm'`
Make sure you have activated your virtual environment and downloaded the model:
```bash
python -m spacy download en_core_web_sm
```

### 2. Protobuf Crash on Python 3.14
If you encounter issues with Protocol Buffers C-extensions on newer Python versions, ensure `run_server.py` is used or set the environment variable:
- Windows PowerShell: `$env:PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION="python"`
- Linux/macOS: `export PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python`

### 3. Ollama Connection Error (`ollama._types.ResponseError` or connection refused)
- Make sure Ollama is installed and running (`ollama serve`).
- Verify the model is downloaded: `ollama run llama3.2:3b`.
- If Ollama is not installed or running, resume parsing and embedding search will still function, but the LLM Chatbot and Resume Improvement endpoints will fail until Ollama is active.

### 4. CORS Errors in Frontend
The FastAPI backend in [`backend/app/main.py`](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/backend/app/main.py) is pre-configured to allow CORS origins `http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`, `http://127.0.0.1:5173`, `http://127.0.0.1:5174`, and `http://127.0.0.1:5175`. If your Vite dev server starts on a different port, check the port in your terminal and update the CORS list in `backend/app/main.py` if needed.
