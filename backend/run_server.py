import os
import sys

# Force pure Python protobuf to prevent C-extension crash on Python 3.14
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

import uvicorn

if __name__ == "__main__":
    print("Starting AI Resume Analyzer Backend...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
