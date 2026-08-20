This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More
# CodeAudit AI

CodeAudit AI is a local web application for reviewing source code with a small autonomous agent pipeline. The browser provides a Monaco-based editor, streams audit progress over a WebSocket, displays performance and security findings, and lets you accept or revert the generated refactor.

The project has two applications:

- `codeaudit-ai/` is the Next.js 16 frontend.
- `backend/` is the FastAPI and LangGraph backend that calls Google Gemini.

## How It Works

When **Run AI Audit** is selected, the frontend opens `ws://localhost:8000/api/ws/review` and sends the source currently in the editor. The backend runs this graph:

```text
Triage -> Performance Auditor -> Security Auditor -> Lead Architect
																			^                  |
																			|                  |
																			+-- re-audit -----+
```

1. **Triage** initializes the review state and detects a language when the client does not provide one.
2. **Performance Auditor** looks for complexity problems, redundant work, memory bloat, and resource leaks.
3. **Security Auditor** looks for injection risks, unsafe functions, exposed secrets, weak cryptography, and related issues.
4. **Lead Architect** asks Gemini to produce corrected code when findings exist while preserving behavior.
5. The graph re-runs the performance and security audits until the review is complete or two remediation iterations have been attempted.

The UI receives status messages for each phase and then a final result containing the original code, updated code, findings, iteration count, and completion state.

## Requirements

- Windows, macOS, or Linux
- Node.js 20 or newer and npm
- Python 3.10 or newer
- A Google Gemini API key

The backend dependency versions are listed in `backend/requirements.txt`; the frontend versions are pinned in `codeaudit-ai/package.json` and `package-lock.json`.

## Configuration

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_MODEL` is optional and defaults to `gemini-2.5-flash`. Keep `.env` out of source control and never put the API key in the Next.js app or browser code.

## Installation

### Backend

From the repository root:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If PowerShell blocks activation, either allow local scripts for your user or activate the environment from a Command Prompt with `\.venv\Scripts\activate.bat`.

### Frontend

In a second terminal:

```powershell
cd codeaudit-ai
npm install
```

## Running Locally

Start the backend first:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then start the frontend in a second terminal:

```powershell
cd codeaudit-ai
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The backend health response is available at [http://localhost:8000/](http://localhost:8000/).

## Frontend Commands

Run these commands from `codeaudit-ai/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## WebSocket Contract

The review endpoint is:

```text
ws://localhost:8000/api/ws/review
```

Send a JSON text message:

```json
{
	"source_code": "def calculate_sum(n):\n    return sum(range(n))",
	"language": "python"
}
```

The server streams status messages such as:

```json
{
	"type": "status",
	"node": "Security",
	"message": "Scanning for security vulnerabilities..."
}
```

The final message has this shape:

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

Errors are sent as `{ "type": "error", "message": "..." }` when the connection remains available.

## Project Structure

```text
.
├── backend/
│   ├── app/main.py                 # FastAPI app and CORS configuration
│   ├── app/api/routes.py            # WebSocket review endpoint
│   ├── app/agents/graph.py          # LangGraph workflow and iteration routing
│   ├── app/agents/triage.py         # Input normalization and language fallback
│   ├── app/agents/performance.py    # Performance audit prompt and parsing
│   ├── app/agents/security.py       # Security audit prompt and parsing
│   ├── app/agents/orchestrator.py   # Gemini-powered code remediation
│   ├── app/core/config.py            # Environment-backed settings
│   └── app/core/state.py             # Shared graph state types
└── codeaudit-ai/
		├── app/page.tsx                 # Main review workspace and WebSocket client
		├── components/                  # Editor, agent status, and result views
		├── types/index.ts               # Frontend WebSocket and result types
		└── package.json                 # Frontend scripts and dependencies
```

## Current Scope and Limitations

- The current UI sends `language: "python"` for every review. The backend has a fallback detector for JavaScript-like input, but language selection is not yet exposed in the UI.
- Reviews depend on Gemini availability and API quota. If a model call fails, the backend reports a medium-severity audit failure with a configuration hint.
- The backend accepts one or more review payloads over an open WebSocket connection, but the frontend closes the socket after the first result.
- There is no persistence layer, authentication, authorization, or server-side user/session management.
- Generated refactors should be reviewed before being used in production. The application does not execute submitted or generated code.

## Troubleshooting

### The UI says the WebSocket server is unreachable

Confirm that the backend is running on port `8000`, that the frontend is open on port `3000`, and that the URL in `codeaudit-ai/app/page.tsx` still matches the backend address.

### Audits return configuration errors

Check that `backend/.env` exists, contains `GEMINI_API_KEY`, and is loaded from the `backend/` working directory. Restart Uvicorn after changing environment variables.

### CORS errors appear in the browser

The backend currently allows only `http://localhost:3000`. Use that origin during local development or update the `allow_origins` list in `backend/app/main.py` for a different frontend origin.

## Security Notes

- Treat submitted code as sensitive; it is included in prompts sent to Gemini.
- Do not commit API keys, `.env` files, generated review data, or private source code.
- Run the backend behind authentication and restrict CORS before exposing it beyond localhost.
- Treat all AI findings and refactors as recommendations that require human review.

## Development Notes

The frontend is a client-side Next.js App Router page. The backend uses FastAPI, Pydantic settings, the Google GenAI SDK, and LangGraph. Changes to the WebSocket payload or result shape should be reflected in both `backend/app/api/routes.py` and `codeaudit-ai/types/index.ts`.

Useful documentation:

- [Next.js documentation](https://nextjs.org/docs)
- [FastAPI documentation](https://fastapi.tiangolo.com/)
- [LangGraph documentation](https://langchain-ai.github.io/langgraph/)
- [Google Gemini API documentation](https://ai.google.dev/gemini-api/docs)
