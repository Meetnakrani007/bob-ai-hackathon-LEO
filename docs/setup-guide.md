# Setup Guide

## Prerequisites

- **Node.js** 20 LTS or higher
- **Python** 3.11 or higher
- **MongoDB** 7 (local or Atlas)
- **Redis** 7 (local or cloud)
- **Git**
- **Docker** (optional, for containerized setup)

## Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/Meetnakrani007/bob-ai-hackathon-LEO.git
cd bob-ai-hackathon-LEO
```

### 2. Set Up Environment Variables

```bash
cp src/.env.example src/.env
```

Edit `src/.env` and fill in:
- `MONGODB_URI` — your MongoDB connection string
- `JWT_ACCESS_SECRET` — generate with `openssl rand -hex 32`
- `JWT_REFRESH_SECRET` — generate with `openssl rand -hex 32`
- `ANTHROPIC_API_KEY` — from console.anthropic.com (needed for Phase 7)

### 3. Start the Backend

```bash
cd src/backend
npm install
npm run dev
```

Verify: `curl http://localhost:5000/api/health`

### 4. Start the Python Analytics Service

```bash
cd src/python
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

Verify: `curl http://localhost:8000/health`

### 5. Start the Frontend

```bash
cd src/frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

### 6. Seed the Database

```bash
cd src/backend
npm run seed
```

## Quick Start (Docker)

```bash
cp src/.env.example src/.env
# Edit src/.env with real values
docker-compose up --build
docker-compose exec backend npm run seed
```

## Verify Installation

| Service | URL | Expected |
|---------|-----|----------|
| Backend | `http://localhost:5000/api/health` | `{ "status": "ok" }` |
| Python | `http://localhost:8000/health` | `{ "status": "ok" }` |
| MCP | `http://localhost:7331/health` | `{ "status": "ok" }` |
| Frontend | `http://localhost:5173` | Dashboard UI |

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Backend won't start | Missing MongoDB | Start `mongod` or check `MONGODB_URI` |
| Python 500 errors | Missing dependencies | `pip install -r requirements.txt` |
| CORS errors | Wrong `CORS_ORIGIN` | Check `.env` matches frontend URL |
| JWT 401 errors | Secret mismatch | Ensure both access/refresh secrets are set |
