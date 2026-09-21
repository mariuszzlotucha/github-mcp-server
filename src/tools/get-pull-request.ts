import z from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { getPullRequest } from "../github/index.js";
import { repoField, pullRequestSummarySchema } from "./schemas.js";
import { readOnlyAnnotations, jsonResult, errorResult } from "./result.js";
import { getPullRequestDescription } from "./descriptions.js";

export function registerGetPullRequestTool(server: McpServer): void {
    server.registerTool(
        'get_pull_request',
        {
            title: 'Pull request details',
            description: getPullRequestDescription,
            inputSchema: z.object({
                repo: repoField,
                number: z.number().int().positive().describe("Pull request number from list_pull_requests")
            }),
            outputSchema: pullRequestSummarySchema.extend({
                additions: z.number(),
                deletions: z.number(),
                changedFiles: z.number(),
                filesTruncated: z.boolean(),
                files: z.array(
                    z.object({
                        filename: z.string(),
                        status: z.string(),
                        additions: z.number(),
                        deletions: z.number(),
                        patch: z.string(),
                        patchTruncated: z.boolean()
                    })
                )
            }),
            annotations: readOnlyAnnotations
        },
        async ({ repo, number }) => {
            try {
                const pullRequest = await getPullRequest(repo, number);
                return jsonResult(pullRequest);
            } catch (error) {
                return errorResult(error);
            }
        }
    )
}
