import z from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { listIssues, getLastRateLimit } from "../github/index.js";
import { repoField, summarySchema } from "./schemas.js";
import { readOnlyAnnotations, jsonResult, errorResult } from "./result.js";
import { listIssuesDescription } from "./descriptions.js";

export function registerListIssuesTool(server: McpServer): void {
    server.registerTool(
        'list_issues',
        {
            title: 'List issues',
            description: listIssuesDescription,
            inputSchema: z.object({
                repo: repoField,
                state: z.enum(['open', 'closed', 'all'])
                    .default('open')
                    .describe('Issue state. Defaults to open only'),
                labels: z.string().optional().describe('Optional comma-separated label filter, e.g. "bug,help wanted"'),
                limit: z.number().int().min(1).max(10).default(10).describe("How many issues to return (max. 10)")
            }),
            outputSchema: z.object({
                count: z.number(),
                issues: z.array(summarySchema),
                rateLimitRemaining: z.number()
            }),
            annotations: readOnlyAnnotations
        },
        async ({ repo, state, labels, limit }) => {
            try {
                const issues = await listIssues(repo, state, Math.min(limit, 10), labels);
                return jsonResult({
                    count: issues.length,
                    issues,
                    rateLimitRemaining: getLastRateLimit().remaining
                });
            } catch (error) {
                return errorResult(error);
            }
        }
    )
}
