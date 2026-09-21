export type RawIssue = {
    number: number;
    title: string;
    state: string;
    body: string | null;
    created_at: string;
    updated_at: string;
    comments: number;
    html_url: string;
    user: { login: string } | null;
    labels: ({ name?: string } | string)[];
    pull_request?: unknown;
}

export type RawComment = {
    body: string | null;
    created_at: string;
    user: { login: string } | null;
}

export type IssueSummary = {
    number: number;
    title: string;
    state: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    labels: string[];
    commentCount: number;
    url: string;
}

export type IssueComment = {
    author: string;
    createdAt: string;
    body: string;
    truncated: boolean;
}

export type IssueDetail = IssueSummary | {
    body: string;
    truncated: boolean;
    originalLength: number;
    comments: IssueComment[];
}

export type RateLimit = {
    remaining: number;
    limit: number;
    resetsAt: string | null;
}