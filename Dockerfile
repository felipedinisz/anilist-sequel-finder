# Build Frontend
FROM node:18-alpine as frontend
WORKDIR /build
COPY frontend/ ./
RUN npm ci && npm run build
RUN test -f dist/index.html && echo "✓ Frontend built successfully" || (echo "ERROR: Frontend build failed" && ls -la dist/ 2>/dev/null && exit 1)

# Build Backend  
FROM python:3.10-slim as backend
WORKDIR /build

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY backend/ ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Final stage - combine everything
FROM python:3.10-slim
WORKDIR /app

# Copy installed Python packages from backend stage
COPY --from=backend /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=backend /usr/local/bin /usr/local/bin

# Copy backend code
COPY backend/ ./

# Copy frontend build
COPY --from=frontend /build/dist ./static/

# Set environment
ENV PYTHONPATH=/app PORT=8000 HOST=0.0.0.0

# Verify frontend is ready
RUN echo "Checking static files:" && ls -la ./static/ && test -f ./static/index.html && echo "✓ Frontend ready" || (echo "ERROR: Frontend not found" && exit 1)

# Run
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
