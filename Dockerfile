# Stage 1: Build Frontend (opcional - se houver mudanças no frontend)
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit || true
COPY frontend/ ./
ENV VITE_API_URL=/api/v1
# Try to build, but don't fail if it fails (we'll use pre-built dist)
RUN npm run build 2>/dev/null || echo "Warning: Frontend build failed, will use pre-built dist"

# Stage 2: Build Backend & Serve
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy entire backend (including app folder)
COPY backend/ .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create static directory
RUN mkdir -p /app/static

# Copy pre-built frontend from repo (committed to git)
COPY frontend/dist/ /app/static/

# Environment Variables
ENV PYTHONPATH=/app
ENV PORT=8000
ENV HOST=0.0.0.0

# Verify frontend files exist
RUN test -f /app/static/index.html && echo "✓ Frontend files ready" || (echo "ERROR: Frontend build not found at /app/static/index.html" && exit 1)

# Run the application using the PORT environment variable (default 8000)
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
