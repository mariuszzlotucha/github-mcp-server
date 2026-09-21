import z from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { listPullRequests, getLastRateLimit } from "../github/index.js";
import { repoField, pullRequestSummarySchema } from "./schemas.js";
import { readOnlyAnnotations, jsonResult, errorResult } from "./result.js";
import { listPullRequestsDescription } from "./descriptions.js";

export function registerListPullRequestsTool(server: McpServer): void {
    server.registerTool(
        'list_pull_requests',
        {
            title: 'List pull requests',
            description: listPullRequestsDescription,
            inputSchema: z.object({
                repo: repoField,
                state: z.enum(['open', 'closed', 'all'])
                    .default('open')
                    .describe('Pull request state. Defaults to open only'),
                limit: z.number().int().min(1).max(10).default(10).describe("How many pull requests to return (max. 10)")
            }),
            outputSchema: z.object({
                count: z.number(),
                pullRequests: z.array(pullRequestSummarySchema),
                rateLimitRemaining: z.number()
            }),
            annotations: readOnlyAnnotations
        },
        async ({ repo, state, limit }) => {
            try {
                const pullRequests = await listPullRequests(repo, state, limit);
                return jsonResult({
                    count: pullRequests.length,
                    pullRequests,
                    rateLimitRemaining: getLastRateLimit().remaining
                });
            } catch (error) {
                return errorResult(error);
            }
        }
    )
}
