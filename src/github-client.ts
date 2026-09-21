import type { RateLimit } from "./types.js";

const API = "https://api.github.com";

function buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'mcp-github-course/1.0'
    };

    const token = process.env.GITHUB_TOKEN;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return headers;
}

function readRateLimit(res: Response): RateLimit {
    const reset = res.headers.get('x-ratelimit-reset');
    return {
        remaining: Number(res.headers.get('x-ratelimit-remaining') ?? -1),
        limit: Number(res.headers.get('x-ratelimit-limit') ?? -1),
        resetsAt: reset ? new Date(Number(reset) * 1000).toISOString() : null
    };
}

let lastRateLimit: RateLimit = { remaining: -1, limit: -1, resetsAt: null };

export function getLastRateLimit(): RateLimit {
    return lastRateLimit;
}

export async function request<T>(path: string): Promise<T> {
    const res = await fetch(`${API}${path}`, { headers: buildHeaders() });
    lastRateLimit = readRateLimit(res);

    if (res.ok) return (await res.json()) as T;

    if (res.status === 403 && lastRateLimit.remaining === 0) {
        throw new Error(
            `Wyczerpany limit żądań (${lastRateLimit.limit}/h). ` +
                `Odnowi się ${lastRateLimit.resetsAt ?? 'wkrótce'}.`,
        );
    }
    if (res.status === 401) {
        throw new Error('Token GITHUB_TOKEN jest nieprawidłowy lub wygasł.');
    }
    if (res.status === 404) {
        throw new Error(
            'Nie znaleziono. Repozytorium nie istnieje, jest prywatne, albo numer zgłoszenia jest zły.'
        );
    }
    throw new Error(`GitHub zwrócił ${res.status} ${res.statusText}`);
}
