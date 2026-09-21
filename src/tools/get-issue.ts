import z from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { getIssue } from "../github/index.js";
import { repoField, summarySchema } from "./schemas.js";
import { readOnlyAnnotations, jsonResult, errorResult } from "./result.js";
import { getIssueDescription } from "./descriptions.js";

export function registerGetIssueTool(server: McpServer): void {
    server.registerTool(
        'get_issue',
        {
            title: 'Treść zgłoszenia',
            description: getIssueDescription,
            inputSchema: z.object({
                repo: repoField,
                number: z.number().int().positive().describe("Numer zgłoszenia z list_issues")
            }),
            outputSchema: summarySchema.extend({
                body: z.string(),
                truncated: z.boolean(),
                originalLength: z.number(),
                comments: z.array(
                    z.object({
                        author: z.string(),
                        createdAt: z.string(),
                        body: z.string(),
                        truncated: z.boolean()
                    })
                )
            }),
            annotations: readOnlyAnnotations
        },
        async ({ repo, number }) => {
            try {
                const issue = await getIssue(repo, number);
                return jsonResult(issue);
            } catch (error) {
                return errorResult(error);
            }
        }
    )
}
