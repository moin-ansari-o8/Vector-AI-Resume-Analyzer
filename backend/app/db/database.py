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
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    """)
    conn.commit()
    conn.close()

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


def save_resume(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    resume_id = resume_data.get("id") or f"res_real_{int(time.time() * 1000)}"
    uploaded_at = resume_data.get("uploaded_at") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    
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
    
    # Also fetch file path to remove file
    cursor.execute("SELECT file_path FROM resumes WHERE id = ?", (resume_id,))
    row = cursor.fetchone()
    if row and row["file_path"] and os.path.exists(row["file_path"]):
        try:
            os.remove(row["file_path"])
        except Exception:
            pass
            
    cursor.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

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
