import { cleanBody } from "../utils/format.js";
import { getLastRateLimit, request } from "./client.js";
import { parseRepo, toSummary } from "./mappers.js";
import type { IssueComment, IssueDetail, IssueSummary, RawComment, RawIssue } from "./types.js";

export { getLastRateLimit };

export async function listIssues(
    repo: string,
    state: 'open' | 'closed' | 'all',
    limit: number,
    labels?: string
): Promise<IssueSummary[]> {
    const { owner, name } = parseRepo(repo);

    const params = new URLSearchParams({
        state,
        per_page: String(Math.min(limit * 3, 100)),
        sort: 'updated',
        direction: 'desc'
    });
    if (labels) params.set('labels', labels);

    const raw = await request<RawIssue[]>(`/repos/${owner}/${name}/issues?${params}`);

    return raw
        .filter((item) => !('pull_request' in item))
        .slice(0, limit)
        .map(toSummary);
}

export async function getIssue(repo: string, issueNumber: number): Promise<IssueDetail> {
    const { owner, name } = parseRepo(repo);
    const base = `/repos/${owner}/${name}/issues/${issueNumber}`;

    const raw = await request<RawIssue>(base);

    if ('pull_request' in raw) {
        throw new Error(
            `#${issueNumber} to pull request, nie zgłoszenie. To narzędzie obsługuje tylko zgłoszenia.`
        );
    }

    const body = cleanBody(raw.body);

    let comments: IssueComment[] = [];
    if (raw.comments > 0) {
        const rawComments = await request<RawComment[]>(`${base}/comments?per_page=20`);
        comments = rawComments.map((c) => {
            const cleaned = cleanBody(c.body, 250);
            return {
                author: c.user?.login ?? '(nieznany)',
                createdAt: c.created_at,
                body: cleaned.text,
                truncated: cleaned.truncated
            };
        });
    }

    return {
        ...toSummary(raw),
        body: body.text,
        truncated: body.truncated,
        originalLength: body.originalLength,
        comments
    };
}
