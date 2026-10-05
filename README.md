# CodeAudit AI

CodeAudit AI is a web-based AI code review workspace. It combines a Monaco editor in a Next.js frontend with a FastAPI backend that runs a LangGraph review pipeline powered by Google Gemini.

The application can:

- Review source code for performance and security problems.
- Stream review progress to the browser over WebSockets.
- Ask an AI orchestrator to produce a behavior-preserving refactor when findings are detected.
- Re-audit generated code for up to two remediation iterations.
- Show the original and updated code so a user can accept or revert the suggested refactor.

## Why This Project Is Helpful

Code reviews are essential, but they can be slow, inconsistent, and easy to postpone when a developer is working alone or a team is moving quickly. CodeAudit AI provides an immediate first pass while code is still being written, helping developers find potential problems before they reach a pull request, staging environment, or production system.

It is useful because it brings several review activities into one small workflow:

- **Faster feedback:** Developers can paste code into the editor and receive performance and security feedback without waiting for a full review cycle.
- **Broader first-pass coverage:** Separate performance and security agents look at different classes of problems, reducing the chance that a useful concern is missed during a quick manual review.
- **Actionable suggestions:** Findings include severity and suggested fixes, making them easier to understand and prioritize than a vague warning.
- **Safer experimentation:** The original code remains available while a proposed refactor is shown separately, so users can compare, accept, or revert the change.
- **Learning through explanation:** Reviewing the findings and generated changes can help newer developers understand complexity, resource usage, and common security risks in practical code.
- **A foundation for team tooling:** The WebSocket API and separate frontend/backend services make it possible to connect the review workflow to future editors, pull-request checks, or internal developer platforms.

CodeAudit AI is best used as an assistant for early feedback and repeatable checks, not as a replacement for experienced human review, tests, static analysis, or domain-specific security assessment.

> AI-generated findings and code changes are recommendations. Review them before using them in production. CodeAudit AI does not execute submitted or generated code.

## Repository Layout

```text
.
├── backend/                 # FastAPI, LangGraph, and Gemini integration
│   ├── app/
│   │   ├── agents/          # Triage, audits, orchestration, and graph routing
│   │   ├── api/             # WebSocket routes
│   │   ├── core/            # Settings and shared graph state
│   │   └── models/          # Pydantic schemas
│   ├── Dockerfile
│   ├── Procfile
│   └── requirements.txt
└── codeaudit-ai/            # Next.js frontend
    ├── app/                 # App Router page and global styles
    ├── components/          # Editor, agent status, and review results
    ├── lib/api.ts           # WebSocket URL resolution
    ├── types/               # Frontend message and result types
    └── package.json
```

## How Reviews Work

When the user selects **Run AI Audit**, the frontend opens a WebSocket and sends the source currently in the editor. The backend processes it through this graph:

```text
START
  |
  v
Triage -> Performance Auditor -> Security Auditor -> Lead Architect
                                                       |
                                                       v
                                  re-audit Performance and Security
                                                       |
                                                       v
                                                      END
```

1. **Triage** initializes shared state and normalizes the language.
2. **Performance Auditor** checks for complexity problems, redundant work, memory waste, and resource leaks.
3. **Security Auditor** checks for injection risks, unsafe functions, exposed secrets, weak cryptography, and similar issues.
4. **Lead Architect** asks Gemini to resolve findings while preserving the original behavior.
5. The graph repeats the audit when unresolved issues remain, stopping when the review is complete or two iterations have been attempted.

The frontend displays status events while the graph runs, then renders findings and the proposed code change.

## Requirements

- Node.js 20 or newer
- npm
- Python 3.10 or newer
- A Google Gemini API key
- PowerShell, Command Prompt, macOS/Linux shell, or equivalent terminal

The backend dependencies are declared in [backend/requirements.txt](backend/requirements.txt). Frontend dependencies and scripts are declared in [codeaudit-ai/package.json](codeaudit-ai/package.json).

## Configuration

Create `backend/.env` with:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Empty | API key used by the backend to call Gemini. |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model used for audits and remediation. |
| `CORS_ORIGINS` | No | Local origins plus `*` | Comma-separated browser origins allowed by FastAPI. |
| `NEXT_PUBLIC_WS_URL` | No | `ws://localhost:8000/api/ws/review` | Frontend WebSocket host or complete endpoint. `http(s)` is converted to `ws(s)`. |

Keep API keys in the backend environment only. Do not commit `.env` files or expose Gemini credentials to the browser.

## Local Development

### 1. Install and start the backend

From the repository root, create a virtual environment:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Add `backend/.env`, then start FastAPI:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend health endpoint is available at [http://localhost:8000/](http://localhost:8000/).

If PowerShell does not permit script activation, use `\.venv\Scripts\activate.bat` from Command Prompt or invoke the environment's Python directly.

### 2. Install and start the frontend

Open a second terminal:

```powershell
cd codeaudit-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter or edit code, and select **Run AI Audit**.

### Frontend commands

Run these from `codeaudit-ai/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |

## WebSocket API

The review endpoint is:

```text
ws://localhost:8000/api/ws/review
```

Send a JSON text message with the source code and language:

```json
{
  "source_code": "def calculate_sum(n):\n    return sum(range(n))",
  "language": "python"
}
```

During processing, the server sends status messages:

```json
{
  "type": "status",
  "node": "Security",
  "message": "Scanning for security vulnerabilities..."
}
```

The final response has this shape:

```json
{
  "type": "result",
  "original_code": "...",
  "updated_code": "...",
  "performance_issues": [
    {
      "issue": "...",
      "severity": "medium",
      "suggested_fix": "..."
    }
  ],
  "security_vulnerabilities": [],
  "iteration_count": 1,
  "review_complete": true
}
```

If the request cannot be processed, the server sends an error message when the connection is still available:

```json
{
  "type": "error",
  "message": "..."
}
```

The backend keeps the WebSocket open for additional review payloads. The current frontend closes it after receiving the first result.

## Deployment

### Backend container

The [backend/Dockerfile](backend/Dockerfile) builds a Python 3.12 image and starts Uvicorn on the port provided by `PORT`:

```powershell
docker build -t codeaudit-backend ./backend
docker run --rm -p 8000:8000 `
  -e GEMINI_API_KEY=your_gemini_api_key `
  -e GEMINI_MODEL=gemini-2.5-flash `
  -e CORS_ORIGINS=http://localhost:3000 `
  codeaudit-backend
```

The [backend/Procfile](backend/Procfile) is compatible with hosts that use a `web` process command, such as:

```text
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend deployment

Build the frontend with `npm run build` and serve it with `npm run start`. Set `NEXT_PUBLIC_WS_URL` to the deployed backend WebSocket endpoint, for example:

```env
NEXT_PUBLIC_WS_URL=wss://api.example.com/api/ws/review
```

Use `wss://` when the frontend is served over HTTPS. Configure the backend `CORS_ORIGINS` with the deployed frontend origin.

## Troubleshooting

### WebSocket connection failed

Confirm that the backend is running on port `8000`, that the frontend is using the expected `NEXT_PUBLIC_WS_URL`, and that the backend is reachable from the browser. For an HTTPS frontend, use a secure `wss://` endpoint.

### Gemini configuration errors

Confirm that `backend/.env` exists, contains `GEMINI_API_KEY`, and is loaded from the backend process working directory. Restart Uvicorn after changing environment variables. Also check model availability and API quota.

### CORS errors

Set `CORS_ORIGINS` to the exact frontend origin, such as `http://localhost:3000` or `https://app.example.com`. Avoid wildcard origins in production.

### The first request is slow

The backend makes several model calls and may perform a remediation pass. A hosted free-tier backend may also need time to wake up before accepting WebSocket connections.

## Security and Privacy

- Source code submitted for review is included in prompts sent to Gemini.
- Do not submit secrets, private keys, credentials, or regulated data unless your data-handling requirements allow it.
- Restrict CORS and add authentication before exposing the backend publicly.
- Put the backend behind HTTPS/WSS in production.
- Treat generated code as untrusted until it has been reviewed and tested.
- The current application has no persistence, user accounts, authorization, or server-side session management.

## Current Limitations

- The current UI submits `python` as the language for every review. Backend fallback detection supports some JavaScript-like input, but language selection is not exposed in the UI.
- Review quality and availability depend on Gemini model behavior, configuration, and quota.
- There is no database or review history.
- Automated backend tests are not currently included in the repository; use the health endpoint, frontend lint/build commands, and a manual WebSocket review as the basic verification path.

## Contributing

Keep frontend and backend message contracts synchronized. Changes to the WebSocket payload or result shape should be updated in both [backend/app/api/routes.py](backend/app/api/routes.py) and [codeaudit-ai/types/index.ts](codeaudit-ai/types/index.ts).

Before opening a change for review:

```powershell
cd codeaudit-ai
npm run lint
npm run build
```

For backend changes, start the API and verify that `http://localhost:8000/` returns a healthy response, then run a review through the frontend.

## Related Documentation

- [Next.js documentation](https://nextjs.org/docs)
- [FastAPI documentation](https://fastapi.tiangolo.com/)
- [LangGraph documentation](https://langchain-ai.github.io/langgraph/)
- [Google Gemini API documentation](https://ai.google.dev/gemini-api/docs)