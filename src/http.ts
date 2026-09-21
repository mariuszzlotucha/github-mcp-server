import { createMcpHandler } from "@modelcontextprotocol/server";
import { createMcpServer } from "./server.js";
import { createServer } from "node:http";
import { toNodeHandler, type NodeIncomingMessageLike } from '@modelcontextprotocol/node';

const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? '0.0.0.0';

const handler = createMcpHandler(() => createMcpServer());
const mcpHandler = toNodeHandler(handler);

const httpServer = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://${HOST}:${PORT}`);

    if (url.pathname === '/mcp') {
        void mcpHandler(req as NodeIncomingMessageLike, res);
        return;
    }

    if (url.pathname === '/healthz') {
        res.writeHead(200).end('ok');
        return;
    }

    res.writeHead(404).end();
});

httpServer.listen(PORT, HOST, () => {
    console.error(`[github-server] HTTP on http://${HOST}:${PORT}/mcp`);
});