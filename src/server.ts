import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import z from "zod";

function createMcpServer(): McpServer {
    const server = new McpServer(
        {name: 'echo-server', version: '1.0.0'},
        { capabilities: { tools: {}}}
    )

    server.registerTool(
        'echo',
        {
            title: 'Echo',
            description: 'Odsyła przekazaną wiadomość wraz ze znacznikiem czasu serwera',
            inputSchema: z.object({
                message: z.string().min(1).max(500).describe('Dowolny tekst, który ma ostać odesłany')
            }),
            outputSchema: z.object({
                echo: z.string(),
                receivedAt: z.string()

            }),
            annotations: {
                readOnlyHint: true,
                destructiveHint: false
            }
        },
        async ({message}) => {
            const output = {
                echo: `Echo ${message}`,
                receivedAt: new Date().toISOString()
            };

            return {
                content: [{ type: 'text', text: JSON.stringify(output)}],
                structuredContent: output
            }
        }
    )

    return server;
}

serveStdio(() => createMcpServer(), {
    legacy: 'serve'
})