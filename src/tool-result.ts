import type { CallToolResult } from "@modelcontextprotocol/server";

export const readOnlyAnnotations = {
    readOnlyHint: true,
    destructiveHint: false
} as const;

export function jsonResult(data: Record<string, unknown>): CallToolResult {
    return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data
    };
}

export function errorResult(error: unknown): CallToolResult {
    return {
        isError: true,
        content: [{ type: 'text', text: (error as Error).message }]
    };
}
