import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import {
    registerListIssuesTool,
    registerGetIssueTool,
    registerListPullRequestsTool,
    registerGetPullRequestTool
} from "./tools/index.js";

export function createMcpServer(): McpServer {
    const server = new McpServer(
        { name: 'github-mcp-server', version: '1.0.0' },
        { capabilities: { tools: {} } }
    );

    registerListIssuesTool(server);
    registerGetIssueTool(server);
    registerListPullRequestsTool(server);
    registerGetPullRequestTool(server);

    return server;
}

serveStdio(() => createMcpServer());
