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

export type RawPullRequest = {
    number: number;
    title: string;
    state: string;
    body: string | null;
    html_url: string;
    user: { login: string } | null;
    additions?: number;
    deletions?: number;
    changed_files?: number;
}

export type RawPullRequestFile = {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
}

export type PullRequestSummary = {
    number: number;
    title: string;
    description: string;
    descriptionTruncated: boolean;
    author: string;
    state: string;
    url: string;
}

export type PullRequestFile = {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch: string;
    patchTruncated: boolean;
}

export type PullRequestDetail = PullRequestSummary & {
    additions: number;
    deletions: number;
    changedFiles: number;
    files: PullRequestFile[];
    filesTruncated: boolean;
}