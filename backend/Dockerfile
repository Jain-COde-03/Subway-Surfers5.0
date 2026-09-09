# ── Backend Dockerfile ────────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install system deps needed by some Python packages (e.g. scipy, ortools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ libffi-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (layer-cached)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the full backend source
COPY . .

# The database file lives in a Docker volume mounted at /data
# We tell database.py to use that path via the DB_PATH env var
ENV DB_PATH=/data/railway.db

# Expose FastAPI port
EXPOSE 8000

# Run with uvicorn; workers=2 is safe for SQLite (no concurrent writes race)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

