import type { IssueSummary, PullRequestSummary, RawIssue, RawPullRequest } from "./types.js";

export function parseRepo(repo: string): { owner: string; name: string } {
    // microsoft/vscode
    const match = /^([\w.-]+)\/([\w.-]+)$/.exec(repo.trim());
    if (!match?.[1] || !match[2]) {
        throw new Error("Nieprawidłowa nazwa repozytorium");
    }

    return { owner: match[1], name: match[2] };
}

export function toSummary(raw: RawIssue): IssueSummary {
    return {
        number: raw.number,
        title: raw.title,
        state: raw.state,
        author: raw.user?.login ?? '(nieznany)',
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
        labels: raw.labels.map((l) => (typeof l === 'string' ? l : (l.name ?? ''))).filter(Boolean),
        commentCount: raw.comments,
        url: raw.html_url
    };
}

export function toPullRequestSummary(
    raw: RawPullRequest,
    description: { text: string; truncated: boolean }
): PullRequestSummary {
    return {
        number: raw.number,
        title: raw.title,
        description: description.text,
        descriptionTruncated: description.truncated,
        author: raw.user?.login ?? '(nieznany)',
        state: raw.state,
        url: raw.html_url
    };
}
