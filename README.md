# github-mcp-server

An [MCP](https://modelcontextprotocol.io) server exposing four read-only tools for browsing issues and pull requests in GitHub repositories: `list_issues`, `get_issue`, `list_pull_requests`, `get_pull_request`.

## Requirements

- Node.js 24+ (uses `--env-file-if-exists`)

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `GITHUB_TOKEN` | no | GitHub personal access token. Without it the server runs on the anonymous rate limit (60 req/h instead of 5000/h) and can't see private repos. |
| `GITHUB_API_URL` | no | Base REST API URL. Only change it for GitHub Enterprise Server. Defaults to `https://api.github.com`. |
| `HOST` | no | Listen interface for HTTP mode (`src/http.ts`). Defaults to `0.0.0.0`. |
| `PORT` | no | Port for HTTP mode. Defaults to `8080`. |

`.env` is gitignored — it never gets committed.

## Running

```bash
npm run dev     # stdio mode with hot reload (tsx watch)
npm run build   # compile to dist/
npm start       # stdio mode from compiled dist/server.js
npm run inspect # MCP Inspector for manually testing the tools
```

The default entrypoint (`src/server.ts`) serves over stdio — for wiring into an MCP client (e.g. Claude Code) as a local server. `src/http.ts` is an alternative entrypoint exposing the same server over HTTP at `/mcp`, plus `/healthz` for health checks.

## Tools

- **`list_issues(repo, state?, labels?, limit?)`** — issue headers (number, title, author, state, labels, comment count) without content. Pull requests are filtered out.
- **`get_issue(repo, number)`** — full content of a single issue plus its comments, with long content truncated.
- **`list_pull_requests(repo, state?, limit?)`** — list of pull requests: number, title, description (truncated to 300 characters), author, state, URL.
- **`get_pull_request(repo, number)`** — PR details: full description, list of changed files with the actual diff (`patch`) plus added/removed line counts per file and overall (`additions`/`deletions`/`changedFiles`). A single file's diff is truncated to 3000 characters, and the file list to 30 — the `patchTruncated`/`filesTruncated`/`descriptionTruncated` flags signal truncation.

All tools are marked `readOnlyHint` and never modify anything on GitHub.

## Project structure

```
src/
├── server.ts          # entrypoint: MCP over stdio
├── http.ts             # entrypoint: MCP over HTTP (/mcp, /healthz)
├── github/              # GitHub API communication + domain logic
│   ├── index.ts           # barrel: module's public API
│   ├── client.ts            # fetch to the GitHub REST API, rate-limit handling
│   ├── mappers.ts             # mapping API responses -> domain types
│   ├── service.ts               # listIssues / getIssue / listPullRequests / getPullRequest
│   └── types.ts                  # Raw* (GitHub API) and Issue*/PullRequest* (domain) types
├── tools/                # MCP tool registration
│   ├── index.ts             # barrel: tool registrars
│   ├── descriptions.ts        # tool descriptions for the model
│   ├── list-issues.ts
│   ├── get-issue.ts
│   ├── list-pull-requests.ts
│   ├── get-pull-request.ts
│   ├── schemas.ts               # shared zod schemas
│   └── result.ts                 # jsonResult/errorResult helpers
└── utils/
    └── format.ts          # content cleanup and truncation (HTML, whitespace)
```

Import from `../github/index.js`, not `../github/service.js` directly — the barrel is the module's public contract.
