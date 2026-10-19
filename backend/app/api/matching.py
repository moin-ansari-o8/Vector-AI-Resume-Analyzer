import time
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.schemas.matching import MatchRecordRequest, MatchRecordResponse
from app.services.job_matcher import match_resume_to_jobs
from app.services.skill_gap import calculate_skill_gap
from app.db.database import (
    save_match,
    get_recent_matches,
    get_matches_for_job,
    get_job_by_id,
    get_all_resumes
)

router = APIRouter(
    prefix="/matching",
    tags=["Job Matching"]
)


class ResumeMatchingRequest(BaseModel):
    resume_text: str
    top_k: int = 5


@router.post("/resume-jobs")
def match_resume_with_jobs(
    request: ResumeMatchingRequest
):
    """
    Match resume text against all jobs stored in Vector DB.
    """
    matches = match_resume_to_jobs(
        resume_text=request.resume_text,
        top_k=request.top_k
    )

    return {
        "matches": matches
    }


@router.get("/recent", response_model=List[MatchRecordResponse])
def get_recent_match_history(limit: int = 50):
    """
    Retrieve recently evaluated candidate-job matches from SQLite database.
    """
    return get_recent_matches(limit=limit)


@router.post("/record", response_model=MatchRecordResponse)
def record_candidate_match(match: MatchRecordRequest):
    """
    Record an evaluated match between a candidate and job in SQLite.
    """
    saved = save_match(match.dict())
    return saved


@router.get("/job/{job_id}", response_model=List[MatchRecordResponse])
def get_candidates_for_job(job_id: str):
    """
    Retrieve ranked candidate matches for a specific job from SQLite database.
    Evaluates all existing candidates against the job requirements if not previously recorded.
    """
    job = get_job_by_id(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    # 1. Fetch any previously recorded matches
    recorded_matches = get_matches_for_job(job_id)
    recorded_by_candidate = {
        m.get("candidate_id") or m.get("candidateId"): m
        for m in recorded_matches
    }

    # 2. Fetch all candidates from resumes database
    all_resumes = get_all_resumes()
    results = []

    req_skills = job.get("requiredSkills") or job.get("required_skills") or []
    exp_req = float(job.get("experienceRequired") or job.get("experience_required") or 0.0)

    for resume in all_resumes:
        cand_id = resume.get("id")
        cand_name = resume.get("candidateName") or resume.get("candidate_name") or cand_id

        if cand_id in recorded_by_candidate:
            results.append(recorded_by_candidate[cand_id])
            continue

        cand_skills = resume.get("skills") or []
        gap = calculate_skill_gap(cand_skills, req_skills)
        skill_pct = gap.get("skill_match_percentage", 0.0)

        cand_exp = float(resume.get("experienceYears") or resume.get("experience_years") or 0.0)
        exp_score = 100.0 if cand_exp >= exp_req else ((cand_exp / exp_req) * 100.0 if exp_req > 0 else 100.0)

        # Weighted heuristic score
        overall_score = int(round(skill_pct * 0.7 + exp_score * 0.3))
        overall_score = min(max(overall_score, 0), 100)

        match_obj = {
            "id": f"eval_{cand_id}_{job['id']}",
            "candidateId": cand_id,
            "candidate_id": cand_id,
            "candidateName": cand_name,
            "candidate_name": cand_name,
            "jobId": job["id"],
            "job_id": job["id"],
            "jobTitle": job.get("title") or job.get("role") or "Position",
            "job_title": job.get("title") or job.get("role") or "Position",
            "score": overall_score,
            "matchedSkills": gap.get("matched_skills", []),
            "matched_skills": gap.get("matched_skills", []),
            "missingSkills": gap.get("missing_skills", []),
            "missing_skills": gap.get("missing_skills", []),
            "timestamp": resume.get("uploadedAt") or resume.get("uploaded_at") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        results.append(match_obj)

    # Sort descending by match score
    results.sort(key=lambda x: x.get("score", 0), reverse=True)
    return results