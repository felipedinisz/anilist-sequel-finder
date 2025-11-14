#!/bin/bash
# Quick start script - run from project root

echo "🚀 Starting AniList Sequel Finder API..."
echo "📍 API will be available at: http://localhost:8000"
echo "📚 Docs will be available at: http://localhost:8000/docs"
echo ""

cd backend
export PYTHONPATH=$(pwd)
../.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
