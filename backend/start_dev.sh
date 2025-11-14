#!/bin/bash
# Start FastAPI development server

cd "$(dirname "$0")"
export PYTHONPATH=$(pwd)
../.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
