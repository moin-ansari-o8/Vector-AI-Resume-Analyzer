import os
import sys

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.job_ingestion import ingest_jobs_csv
from app.db.database import init_db, get_all_jobs
from app.services.vector_db import collection

def main():
    print("=" * 60)
    print("AI Resume Analyzer: Production Job Roles Ingestion Pipeline")
    print("=" * 60)

    init_db()

    csv_path = os.path.join(backend_dir, "data", "raw", "job_roles.csv")
    print(f"Reading dataset from: {csv_path}")

    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} does not exist!")
        sys.exit(1)

    print("Generating fine-tuned vector embeddings and inserting into SQLite and ChromaDB...")
    count = ingest_jobs_csv(csv_path)

    print(f"\nSuccessfully ingested {count} job roles!")
    print(f"Total jobs in SQLite database: {len(get_all_jobs())}")
    print(f"Total job vectors in ChromaDB collection: {collection.count()}")
    print("=" * 60)

if __name__ == "__main__":
    main()
