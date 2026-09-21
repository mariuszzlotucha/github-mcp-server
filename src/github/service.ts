import { cleanBody, truncate } from "../utils/format.js";
import { getLastRateLimit, request } from "./client.js";
import { parseRepo, toSummary, toPullRequestSummary } from "./mappers.js";
import type {
    IssueComment,
    IssueDetail,
    IssueSummary,
    PullRequestDetail,
    PullRequestFile,
    PullRequestSummary,
    RawComment,
    RawIssue,
    RawPullRequest,
    RawPullRequestFile
} from "./types.js";

export { getLastRateLimit };

const LIST_DESCRIPTION_MAX_CHARS = 300;
const PATCH_MAX_CHARS = 3000;
const MAX_FILES = 30;

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
            `#${issueNumber} is a pull request, not an issue. This tool only handles issues.`
        );
    }

    const body = cleanBody(raw.body);

    let comments: IssueComment[] = [];
    if (raw.comments > 0) {
        const rawComments = await request<RawComment[]>(`${base}/comments?per_page=20`);
        comments = rawComments.map((c) => {
            const cleaned = cleanBody(c.body, 250);
            return {
                author: c.user?.login ?? '(unknown)',
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

export async function listPullRequests(
    repo: string,
    state: 'open' | 'closed' | 'all',
    limit: number
): Promise<PullRequestSummary[]> {
    const { owner, name } = parseRepo(repo);

    const params = new URLSearchParams({
        state,
        per_page: String(limit),
        sort: 'updated',
        direction: 'desc'
    });

    const raw = await request<RawPullRequest[]>(`/repos/${owner}/${name}/pulls?${params}`);

    return raw.map((item) => toPullRequestSummary(item, cleanBody(item.body, LIST_DESCRIPTION_MAX_CHARS)));
}

export async function getPullRequest(repo: string, prNumber: number): Promise<PullRequestDetail> {
    const { owner, name } = parseRepo(repo);
    const base = `/repos/${owner}/${name}/pulls/${prNumber}`;

    const raw = await request<RawPullRequest>(base);
    const description = cleanBody(raw.body);

    const rawFiles = await request<RawPullRequestFile[]>(`${base}/files?per_page=100`);

    const files: PullRequestFile[] = rawFiles.slice(0, MAX_FILES).map((f) => {
        const patch = f.patch
            ? truncate(f.patch, PATCH_MAX_CHARS)
            : { text: '(no diff available - binary file or too large)', truncated: false };

        return {
            filename: f.filename,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
            patch: patch.text,
            patchTruncated: patch.truncated
        };
    });

    return {
        ...toPullRequestSummary(raw, description),
        additions: raw.additions ?? 0,
        deletions: raw.deletions ?? 0,
        changedFiles: raw.changed_files ?? rawFiles.length,
        files,
        filesTruncated: rawFiles.length > MAX_FILES
    };
}
