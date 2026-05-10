# 📝 Markdown Note & Grammar Engine
### IAaaS Core Module — v1.0

A high-performance Node.js service for managing Markdown notes with a built-in transformation pipeline and grammar validation layer. Designed around Domain-Driven Design principles with a clean separation between controllers, services, and utilities.

---

## Features

- **Markdown Persistence** — Upload `.md` files stored securely with UUID-based naming to prevent collisions
- **HTML Transformation** — Converts Markdown to sanitized, XSS-safe HTML on demand
- **Grammar Validation** — Integrates with the LanguageTool API to catch grammatical errors and spelling mistakes in plain text extracted from Markdown
- **Centralized Error Handling** — Async middleware catches all unhandled errors without crashing the server
- **Rate Limiting** — Built-in request throttling on note routes to protect the grammar API
- **Structured Logging** — Morgan + Winston pipeline for production-level request and error monitoring

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v20+ (ES Modules) |
| Framework | Express.js |
| File Upload | Multer |
| Markdown Parser | Marked |
| HTML Sanitizer | DOMPurify + JSDOM |
| HTTP Client | Axios |
| Grammar API | LanguageTool (`/v2/check`) |
| ID Generation | UUID v4 |
| Environment | Dotenv |
| Logging | Morgan + Winston |

---

## Project Structure

```
markdown-note-taking-app/
├── src/
│   ├── app.js                  # Express app setup, middleware, routes
│   ├── config/
│   │   └── storage.js          # Multer disk storage with UUID filenames
│   ├── controller/
│   │   └── noteController.js   # Request/response orchestration
│   ├── middleware/
│   │   ├── asyncHandler.js     # Wraps async controllers to catch errors
│   │   ├── errorHandler.js     # Global error handler middleware
│   │   ├── morganMiddleware.js # HTTP request logging
│   │   └── rateLimiter.js      # Route-level rate limiting
│   ├── routes/
│   │   └── noteRoutes.js       # API route definitions
│   ├── services/
│   │   ├── grammarService.js   # LanguageTool API integration
│   │   ├── noteService.js      # File I/O and note management
│   │   └── parser.js           # Markdown → sanitized HTML conversion
│   └── utils/
│       └── logger.js           # Winston logger instance
├── uploads/                    # Stored .md files (auto-created)
├── .env
├── package.json
└── server.js                   # Entry point
```

---

## Environment Setup

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
```

> **Important:** `dotenv.config()` must be called before any other imports in `server.js`. Because ES module `import` statements are hoisted, use a dedicated `env.js` file to guarantee `.env` is loaded first:

```javascript
// src/env.js
import dotenv from "dotenv";
dotenv.config();
```

```javascript
// server.js
import "./src/env.js";  // ← must be first
import app from "./src/app.js";
```

---

## Local Setup

**1. Clone and install:**

```bash
git clone https://github.com/git-o3/markdown-note-api.git
cd markdown-note-taking-app
npm install
```

**2. Initialize storage directory:**

```bash
mkdir uploads
```

**3. Configure environment:**

```bash
cp .env.example .env
```

**4. Start the development server:**

```bash
npm run dev
```

Server starts at `http://localhost:3000`.

---

## API Reference

### Health Check

```
GET /api/v1/health
```

Returns `200 OK` if the server is running.

---

### Notes Management

#### Upload a Note

```
POST /api/v1/notes/upload
Content-Type: multipart/form-data
```

| Field | Type | Description |
|---|---|---|
| `note` | File | A `.md` file to upload |

**Response:**
```json
{
  "id": "c51b4e4c-178b-4acf-90e3-5434804293d0.md",
  "originalName": "my-note.md",
  "mimeType": "text/markdown",
  "size": 1024
}
```

---

#### List All Notes

```
GET /api/v1/notes
```

**Response:**
```json
["c51b4e4c-178b-4acf-90e3-5434804293d0.md", "a3f9...md"]
```

---

### Processing Pipeline

#### Render Note as HTML

```
GET /api/v1/notes/:id/render
```

Reads the `.md` file, converts it to HTML via `marked`, sanitizes it with DOMPurify to prevent XSS, and returns the result.

**Response:**
```json
{
  "html": "<h1>My Note</h1><p>Content here...</p>"
}
```

**Errors:**
- `404` — Note not found (`ARCHIVE_NOT_FOUND`)

---

#### Grammar & Spelling Check

```
GET /api/v1/notes/:id/grammar
```

Reads the `.md` file, strips Markdown syntax to plain text, and sends it to the LanguageTool API for analysis.

**Response:**
```json
{
  "noteId": "c51b4e4c-178b-4acf-90e3-5434804293d0.md",
  "issuesCount": 2,
  "issues": [
    {
      "message": "The pronoun 'I' must be used with a non-third-person form of a verb.",
      "shortMessage": "Agreement error",
      "offset": 20,
      "length": 3,
      "replacements": ["have"],
      "context": "Mental Discipline I has a dream..."
    },
    {
      "message": "Possible spelling mistake found.",
      "shortMessage": "Spelling mistake",
      "offset": 84,
      "length": 10,
      "replacements": ["suppressing"],
      "context": "...about supressing emotions..."
    }
  ]
}
```

**Errors:**
- `500` — LanguageTool API is unreachable (`Grammar Service is currently unavailable`)

---

## Architecture

```
Request
   │
   ▼
Middleware (Morgan → RateLimiter)
   │
   ▼
Router (noteRoutes.js)
   │
   ▼
Controller (noteController.js)
   │         │
   ▼         ▼
noteService  grammarService
(File I/O)  (LanguageTool API)
   │
   ▼
parser.js (Markdown → HTML → Sanitize)
   │
   ▼
Response
   │
   ▼
GlobalErrorHandler (catches anything that throws)
```

**Layer responsibilities:**

- **Middleware** — Cross-cutting concerns: logging, rate limiting, error handling
- **Controller** — Reads request params, calls services, sends response
- **Service Layer** — All business logic: file I/O, external API calls
- **Utility Layer** — Stateless helpers: parser, logger

---

## Design Decisions

**UUID filenames** — Every uploaded note gets a UUID as its filename (`uuidv4() + ext`). This prevents naming collisions, makes files unguessable, and allows the ID to double as the API resource identifier.

**Markdown stripping before grammar check** — Raw Markdown sent to LanguageTool produces noisy false positives (`##`, `**bold**` flagged as errors). The service strips tags with `marked.parse()` + regex before sending to the API.

**DOMPurify on the server** — The render pipeline sanitizes HTML server-side using DOMPurify with a JSDOM window. This prevents XSS even if the client renders the HTML directly.

**ES Module dotenv hoisting** — ES module `import` statements are statically hoisted before any code runs. `dotenv.config()` in `server.js` runs too late for modules that read `process.env` at load time. The fix is importing a dedicated `env.js` as the first import so dotenv loads before anything else.

---

## Known Limitations

- **No authentication** — Note IDs are UUIDs (unguessable) but there is no user session or auth layer yet
- **LanguageTool rate limits** — The free public API at `api.languagetool.org` throttles heavy usage. For production, run a local LanguageTool instance via Docker: `docker run -d -p 8010:8010 erikvl87/languagetool`
- **No delete endpoint** — Notes are append-only in v1.0
- **Flat file storage** — All notes live in a single `uploads/` directory; no folder structure or tagging yet

---

## License



Project URL: https://roadmap.sh/projects/markdown-note-taking-app
