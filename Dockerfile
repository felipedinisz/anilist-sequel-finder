# Build Frontend
FROM node:18-alpine as frontend
WORKDIR /app
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm ci && npm run build
RUN test -f dist/index.html || (echo "ERROR: Frontend build failed" && ls -la dist/ && exit 1)

# Build Backend
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY backend/ ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend build from builder stage
COPY --from=frontend /app/frontend/dist ./static/

# Set environment
ENV PYTHONPATH=/app PORT=8000 HOST=0.0.0.0

# Verify frontend is ready
RUN ls -la ./static/ && test -f ./static/index.html && echo "✓ Frontend ready" || (echo "ERROR: Frontend not found in static/" && exit 1)

# Run
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
