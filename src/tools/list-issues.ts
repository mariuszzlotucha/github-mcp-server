import z from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { listIssues, getLastRateLimit } from "../github.js";
import { repoField, summarySchema } from "../schemas.js";
import { readOnlyAnnotations, jsonResult, errorResult } from "../tool-result.js";

export function registerListIssuesTool(server: McpServer): void {
    server.registerTool(
        'list_issues',
        {
            title: 'Lista zgłoszeń',
            description:
                'Zwraca nagłówki zgłoszeń z repozytorium na GitHubie: numer, tytuł, autora, stan, etykiety ' +
                'i liczbę komentarzy - BEZ treści. ' +
                'Użyj tego jako pierwszego kroku, gdy użytkownik pyta o zgłoszenia, błędy lub prośby o funkcje: ' +
                'najpierw obejrzyj nagłówki, potem pobierz treść tylko tych, które są naprawdę potrzebne. ' +
                'Pull requesty są automatycznie odfiltrowane - zwracane są wyłącznie zgłoszenia. ' +
                'Repozytorium podaje się w formacie wlasciciel/nazwa, np. "modelcontextprotocol/servers".',
            inputSchema: z.object({
                repo: repoField,
                state: z.enum(['open', 'closed', 'all'])
                    .default('open')
                    .describe('Stan zgłoszeń. Domyślnie tylko otwarte'),
                labels: z.string().optional().describe('Opcjonalny filtr etykiet, po przecinku, np. "bug,help wanted"'),
                limit: z.number().int().min(1).max(10).default(10).describe("Ile zgłoszeń zwrócić (max. 10)")
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
