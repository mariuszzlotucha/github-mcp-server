import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { registerListIssuesTool } from "./tools/list-issues.js";
import { registerGetIssueTool } from "./tools/get-issue.js";

export function createMcpServer(): McpServer {
    const server = new McpServer(
        { name: 'github-mcp-server', version: '1.0.0' },
        { capabilities: { tools: {} } }
    );

    registerListIssuesTool(server);
    registerGetIssueTool(server);

    return server;
}

serveStdio(() => createMcpServer());
