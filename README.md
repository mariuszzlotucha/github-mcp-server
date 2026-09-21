# github-mcp-server

Serwer [MCP](https://modelcontextprotocol.io) udostępniający modelom cztery narzędzia tylko do odczytu, do przeglądania zgłoszeń (issues) i pull requestów w repozytoriach na GitHubie: `list_issues`, `get_issue`, `list_pull_requests`, `get_pull_request`.

## Wymagania

- Node.js 24+ (używa `--env-file-if-exists`)

## Instalacja

```bash
npm install
cp .env.example .env
```

Uzupełnij `.env`:

| Zmienna | Wymagana | Opis |
| --- | --- | --- |
| `GITHUB_TOKEN` | nie | Personal access token GitHuba. Bez niego działa na anonimowym limicie 60 żądań/h zamiast 5000/h i nie widzi prywatnych repo. |
| `GITHUB_API_URL` | nie | Bazowy URL REST API. Zmień tylko dla GitHub Enterprise Server. Domyślnie `https://api.github.com`. |
| `HOST` | nie | Interfejs nasłuchu dla trybu HTTP (`src/http.ts`). Domyślnie `0.0.0.0`. |
| `PORT` | nie | Port dla trybu HTTP. Domyślnie `8080`. |

`.env` jest w `.gitignore` — nie trafia do repozytorium.

## Uruchamianie

```bash
npm run dev     # tryb stdio z hot-reloadem (tsx watch)
npm run build   # kompilacja do dist/
npm start       # tryb stdio ze skompilowanego dist/server.js
npm run inspect # MCP Inspector do ręcznego testowania narzędzi
```

Domyślny entrypoint (`src/server.ts`) serwuje przez stdio — do podpięcia pod klienta MCP (np. Claude Code) jako lokalny serwer. `src/http.ts` to alternatywny entrypoint wystawiający ten sam serwer pod `/mcp` przez HTTP oraz `/healthz` do healthchecków.

## Narzędzia

- **`list_issues(repo, state?, labels?, limit?)`** — nagłówki zgłoszeń (numer, tytuł, autor, stan, etykiety, liczba komentarzy) bez treści. Pull requesty są odfiltrowane.
- **`get_issue(repo, number)`** — pełna treść jednego zgłoszenia wraz z komentarzami, z obcinaniem długich treści.
- **`list_pull_requests(repo, state?, limit?)`** — lista pull requestów: numer, tytuł, opis (obcięty do 300 znaków), autor, stan, URL.
- **`get_pull_request(repo, number)`** — szczegóły PR-a: pełny opis, lista zmienionych plików z faktycznym diffem (`patch`) oraz liczbą dodanych/usuniętych linijek per plik i łącznie (`additions`/`deletions`/`changedFiles`). Diff pojedynczego pliku jest obcinany do 3000 znaków, a lista plików do 30 — flagi `patchTruncated`/`filesTruncated`/`descriptionTruncated` sygnalizują obcięcie.

Wszystkie narzędzia są oznaczone jako `readOnlyHint` i nie modyfikują niczego na GitHubie.

## Struktura projektu

```
src/
├── server.ts          # entrypoint: MCP przez stdio
├── http.ts             # entrypoint: MCP przez HTTP (/mcp, /healthz)
├── github/              # komunikacja z GitHub API + logika domenowa
│   ├── index.ts           # barrel: publiczne API modułu
│   ├── client.ts            # fetch do GitHub REST API, obsługa rate limitu
│   ├── mappers.ts             # mapowanie odpowiedzi API -> typy domenowe
│   ├── service.ts               # listIssues / getIssue / listPullRequests / getPullRequest
│   └── types.ts                  # typy Raw* (GitHub API) i Issue*/PullRequest* (domenowe)
├── tools/                # rejestracja narzędzi MCP
│   ├── index.ts             # barrel: rejestratory narzędzi
│   ├── descriptions.ts        # opisy narzędzi dla modelu
│   ├── list-issues.ts
│   ├── get-issue.ts
│   ├── list-pull-requests.ts
│   ├── get-pull-request.ts
│   ├── schemas.ts               # współdzielone schematy zod
│   └── result.ts                 # helpery jsonResult/errorResult
└── utils/
    └── format.ts          # czyszczenie i obcinanie treści (HTML, whitespace)
```

Importuj z `../github/index.js`, nie z `../github/service.js` bezpośrednio — barrel jest publicznym kontraktem modułu.
