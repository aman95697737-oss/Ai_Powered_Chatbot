"""
Shim module to ensure 'backend.xxx' imports resolve properly regardless of
whether the working directory is the repository root or the 'backend/' directory
(essential for Render, Railway, Docker, or direct uvicorn deployments).
"""
from pathlib import Path

__path__ = [str(Path(__file__).resolve().parent)]
