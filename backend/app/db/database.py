import os
import json
import sqlite3
import time
from typing import Dict, List, Any, Optional

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
DB_PATH = os.path.join(DB_DIR, "resumes.db")


def get_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        candidate_name TEXT,
        role TEXT,
        experience_years REAL,
        status TEXT DEFAULT 'ready',
        skills TEXT,
        raw_text TEXT,
        sections TEXT,
        structured_data TEXT,
        file_path TEXT,
        uploaded_at TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        role TEXT,
        company TEXT,
        location TEXT,
        description TEXT,
        required_skills TEXT,
        experience_required REAL DEFAULT 0,
        matches_count INTEGER DEFAULT 0,
        added_at TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        candidate_name TEXT,
        job_id TEXT NOT NULL,
        job_title TEXT,
        score INTEGER NOT NULL,
        matched_skills TEXT,
        missing_skills TEXT,
        timestamp TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    """)

    # Seed default jobs if empty
    cursor.execute("SELECT count(*) FROM jobs")
    row = cursor.fetchone()
    if row and row[0] == 0:
        _seed_jobs_from_file(cursor)

    conn.commit()
    conn.close()


def _seed_jobs_from_file(cursor: sqlite3.Cursor):
    """
    Seed initial jobs from jobs.json into SQLite if table is empty.
    """
    possible_paths = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data", "jobs", "jobs.json"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "jobs", "jobs.json"),
        os.path.join(DB_DIR, "jobs", "jobs.json"),
    ]

    dataset_path = None
    for p in possible_paths:
        if os.path.exists(p):
            dataset_path = p
            break

    if not dataset_path:
        return

    try:
        from app.services.job_processor import process_job_description

        with open(dataset_path, "r", encoding="utf-8") as f:
            jobs_data = json.load(f)

        now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        for j in jobs_data:
            processed = process_job_description(
                title=j.get("title", ""),
                company=j.get("company", ""),
                location=j.get("location", ""),
                description=j.get("description", "")
            )
            job_id = j.get("job_id") or f"job_{int(time.time() * 1000)}"
            cursor.execute("""
            INSERT OR IGNORE INTO jobs (
                id, title, role, company, location, description,
                required_skills, experience_required, matches_count, added_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                job_id,
                j.get("title", "Untitled Role"),
                j.get("title", "Untitled Role"),
                j.get("company", "Company"),
                j.get("location", "Remote"),
                j.get("description", ""),
                json.dumps(processed.get("required_skills", [])),
                float(processed.get("experience_required", 0)),
                0,
                now_iso
            ))
    except Exception as e:
        print(f"Warning: Failed to seed default jobs: {e}")


# ---------------------------------------------------------------------------
# Settings Operations
# ---------------------------------------------------------------------------

def get_setting(key: str, default: Any = None) -> Any:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row["value"]
    return default


def set_setting(key: str, value: str) -> None:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, str(value)))
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Resumes Operations
# ---------------------------------------------------------------------------

def save_resume(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    resume_id = resume_data.get("id") or f"res_real_{int(time.time() * 1000)}"
    uploaded_at = resume_data.get("uploaded_at") or resume_data.get("uploadedAt") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    skills_json = json.dumps(resume_data.get("skills", []))
    sections_json = json.dumps(resume_data.get("sections", {}))
    structured_json = json.dumps(resume_data.get("structured_data", {}))

    cursor.execute("""
    INSERT OR REPLACE INTO resumes (
        id, filename, candidate_name, role, experience_years, status,
        skills, raw_text, sections, structured_data, file_path, uploaded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        resume_id,
        resume_data.get("filename", "resume.pdf"),
        resume_data.get("candidate_name") or resume_data.get("candidateName", "Candidate"),
        resume_data.get("role", "Candidate"),
        float(resume_data.get("experience_years") or resume_data.get("experienceYears") or 0.0),
        resume_data.get("status", "ready"),
        skills_json,
        resume_data.get("raw_text", ""),
        sections_json,
        structured_json,
        resume_data.get("file_path", ""),
        uploaded_at
    ))

    conn.commit()
    conn.close()

    return get_resume_by_id(resume_id)


def get_all_resumes() -> List[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resumes ORDER BY uploaded_at DESC")
    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        results.append(_format_row(row))
    return results


def get_resume_by_id(resume_id: str) -> Optional[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resumes WHERE id = ?", (resume_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    return _format_row(row)


def update_resume(resume_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    existing = get_resume_by_id(resume_id)
    if not existing:
        return None

    for k, v in updates.items():
        existing[k] = v

    return save_resume(existing)


def delete_resume(resume_id: str) -> bool:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT file_path FROM resumes WHERE id = ?", (resume_id,))
    row = cursor.fetchone()
    if row and row["file_path"] and os.path.exists(row["file_path"]):
        try:
            os.remove(row["file_path"])
        except Exception:
            pass
        converted_pdf = os.path.splitext(row["file_path"])[0] + ".pdf"
        if os.path.exists(converted_pdf) and converted_pdf != row["file_path"]:
            try:
                os.remove(converted_pdf)
            except Exception:
                pass

    cursor.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


# ---------------------------------------------------------------------------
# Jobs Operations
# ---------------------------------------------------------------------------

def save_job(job_data: Dict[str, Any]) -> Dict[str, Any]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    job_id = job_data.get("id") or job_data.get("job_id") or f"job_{int(time.time() * 1000)}"
    title = job_data.get("title") or job_data.get("role") or "New Position"
    role = job_data.get("role") or title
    company = job_data.get("company") or ""
    location = job_data.get("location") or ""
    description = job_data.get("description") or ""

    skills = job_data.get("required_skills") or job_data.get("requiredSkills") or []
    if isinstance(skills, str):
        skills = [s.strip() for s in skills.split(",") if s.strip()]

    skills_json = json.dumps(skills)
    experience_required = float(job_data.get("experience_required") or job_data.get("experienceRequired") or 0.0)
    matches_count = int(job_data.get("matches_count") or job_data.get("matchesCount") or 0)
    added_at = job_data.get("added_at") or job_data.get("addedAt") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    cursor.execute("""
    INSERT OR REPLACE INTO jobs (
        id, title, role, company, location, description,
        required_skills, experience_required, matches_count, added_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        job_id,
        title,
        role,
        company,
        location,
        description,
        skills_json,
        experience_required,
        matches_count,
        added_at
    ))

    conn.commit()
    conn.close()

    return get_job_by_id(job_id)


def get_all_jobs() -> List[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs ORDER BY added_at DESC")
    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        results.append(_format_job_row(row))
    return results


def get_job_by_id(job_id: str) -> Optional[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    return _format_job_row(row)


def delete_job(job_id: str) -> bool:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


def increment_job_matches(job_id: str) -> None:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE jobs SET matches_count = matches_count + 1 WHERE id = ?", (job_id,))
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Match Records Operations
# ---------------------------------------------------------------------------

def save_match(match_data: Dict[str, Any]) -> Dict[str, Any]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    match_id = match_data.get("id") or f"match_{int(time.time() * 1000)}"
    candidate_id = match_data.get("candidate_id") or match_data.get("candidateId") or "candidate"
    candidate_name = match_data.get("candidate_name") or match_data.get("candidateName") or candidate_id
    job_id = match_data.get("job_id") or match_data.get("jobId") or "job"
    job_title = match_data.get("job_title") or match_data.get("jobTitle") or job_id
    score = int(match_data.get("score") or 0)

    matched_skills = match_data.get("matched_skills") or match_data.get("matchedSkills") or []
    missing_skills = match_data.get("missing_skills") or match_data.get("missingSkills") or []
    timestamp = match_data.get("timestamp") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    cursor.execute("""
    INSERT OR REPLACE INTO matches (
        id, candidate_id, candidate_name, job_id, job_title,
        score, matched_skills, missing_skills, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        match_id,
        candidate_id,
        candidate_name,
        job_id,
        job_title,
        score,
        json.dumps(matched_skills),
        json.dumps(missing_skills),
        timestamp
    ))

    # Also increment matching count on the job
    cursor.execute("UPDATE jobs SET matches_count = matches_count + 1 WHERE id = ?", (job_id,))

    conn.commit()
    conn.close()

    return {
        "id": match_id,
        "candidateId": candidate_id,
        "candidate_id": candidate_id,
        "candidateName": candidate_name,
        "jobId": job_id,
        "job_id": job_id,
        "jobTitle": job_title,
        "score": score,
        "matchedSkills": matched_skills,
        "matched_skills": matched_skills,
        "missingSkills": missing_skills,
        "missing_skills": missing_skills,
        "timestamp": timestamp
    }


def get_recent_matches(limit: int = 50) -> List[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM matches ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()

    return [_format_match_row(row) for row in rows]


def get_matches_for_job(job_id: str) -> List[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM matches WHERE job_id = ? ORDER BY score DESC", (job_id,))
    rows = cursor.fetchall()
    conn.close()

    return [_format_match_row(row) for row in rows]


def get_matches_for_resume(candidate_id: str) -> List[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM matches WHERE candidate_id = ? ORDER BY score DESC", (candidate_id,))
    rows = cursor.fetchall()
    conn.close()

    return [_format_match_row(row) for row in rows]


# ---------------------------------------------------------------------------
# Formatting Helpers
# ---------------------------------------------------------------------------

def _format_row(row: sqlite3.Row) -> Dict[str, Any]:
    skills = []
    try:
        skills = json.loads(row["skills"]) if row["skills"] else []
    except Exception:
        skills = []

    sections = {}
    try:
        sections = json.loads(row["sections"]) if row["sections"] else {}
    except Exception:
        sections = {}

    structured_data = {}
    try:
        structured_data = json.loads(row["structured_data"]) if row["structured_data"] else {}
    except Exception:
        structured_data = {}

    return {
        "id": row["id"],
        "filename": row["filename"],
        "candidateName": row["candidate_name"],
        "candidate_name": row["candidate_name"],
        "role": row["role"],
        "experienceYears": row["experience_years"],
        "experience_years": row["experience_years"],
        "status": row["status"],
        "skills": skills,
        "raw_text": row["raw_text"],
        "sections": sections,
        "structured_data": structured_data,
        "file_path": row["file_path"],
        "uploadedAt": row["uploaded_at"],
        "uploaded_at": row["uploaded_at"]
    }


def _format_job_row(row: sqlite3.Row) -> Dict[str, Any]:
    skills = []
    try:
        skills = json.loads(row["required_skills"]) if row["required_skills"] else []
    except Exception:
        skills = []

    return {
        "id": row["id"],
        "title": row["title"],
        "role": row["role"] or row["title"],
        "company": row["company"] or "",
        "location": row["location"] or "",
        "description": row["description"] or "",
        "requiredSkills": skills,
        "required_skills": skills,
        "experienceRequired": row["experience_required"],
        "experience_required": row["experience_required"],
        "matchesCount": row["matches_count"],
        "matches_count": row["matches_count"],
        "addedAt": row["added_at"],
        "added_at": row["added_at"]
    }


def _format_match_row(row: sqlite3.Row) -> Dict[str, Any]:
    matched = []
    missing = []
    try:
        matched = json.loads(row["matched_skills"]) if row["matched_skills"] else []
    except Exception:
        matched = []
    try:
        missing = json.loads(row["missing_skills"]) if row["missing_skills"] else []
    except Exception:
        missing = []

    return {
        "id": row["id"],
        "candidateId": row["candidate_id"],
        "candidate_id": row["candidate_id"],
        "candidateName": row["candidate_name"] or row["candidate_id"],
        "jobId": row["job_id"],
        "job_id": row["job_id"],
        "jobTitle": row["job_title"] or row["job_id"],
        "score": row["score"],
        "matchedSkills": matched,
        "matched_skills": matched,
        "missingSkills": missing,
        "missing_skills": missing,
        "timestamp": row["timestamp"]
    }
