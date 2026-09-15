# Contributing to SupplyGuard AI

Thank you for your interest in contributing to SupplyGuard AI!

## Development Setup

1. Clone the repository
2. Copy `src/.env.example` to `src/.env` and fill in values
3. Install dependencies for each service:
   - `cd src/backend && npm install`
   - `cd src/frontend && npm install`
   - `cd src/python && pip install -r requirements.txt`
4. Start MongoDB and Redis (via Docker or locally)
5. Run the seed script: `cd src/backend && npm run seed`

## Code Style

- **TypeScript**: Follow ESLint + Prettier configurations
- **Python**: Follow PEP 8, use type hints
- **Commits**: Use conventional commit messages

## Branch Strategy

- `main` — production-ready code
- `dev` — development branch
- Feature branches: `feature/<name>`

## Pull Request Process

1. Create a feature branch from `dev`
2. Make your changes
3. Run tests: `npm test` (backend), `pytest` (python)
4. Submit a PR with a clear description
5. Wait for CI to pass and code review

## Testing

- Backend: `cd src/backend && npm test`
- Python: `cd src/python && pytest`
- Frontend: `cd src/frontend && npm test`

## Architecture

See [docs/architecture.md](docs/architecture.md) for architecture documentation.
