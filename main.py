"""
Root entry point for cloud deployments (Render, Railway, Docker, etc.)
Allows running either:
  uvicorn backend.main:app --host 0.0.0.0 --port $PORT
or:
  uvicorn main:app --host 0.0.0.0 --port $PORT
"""
import os
import sys
from pathlib import Path

_root_dir = Path(__file__).resolve().parent
if str(_root_dir) not in sys.path:
    sys.path.insert(0, str(_root_dir))

from backend.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port)
