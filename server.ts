import fs from "node:fs/promises";
import path from "node:path";
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";

const UI_RESOURCE_URI = "ui://vibehuus/mcp-app.html";

// Official MCP Apps documentation, served as raw markdown (Mintlify `.md`).
const DOCS_URI = "https://modelcontextprotocol.io/extensions/apps/overview.md";

const NEXT_EVENT = {
  title: "From Vibecoding to Agentic Engineering",
  date: "2026-06-05",
  venue: "Haus am Fluss",
  city: "Bern",
};

const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

let docsCache: string | undefined;
async function fetchDocs(): Promise<string> {
  if (docsCache) return docsCache;
  const res = await fetch(DOCS_URI);
  if (!res.ok) {
    throw new Error(`Failed to fetch MCP Apps docs: ${res.status}`);
  }
  docsCache = await res.text();
  return docsCache;
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "Vibehuus MCP UI",
    version: "0.1.0",
  });

  // Model-visible: opens the panel showing Vibehuus' next event.
  registerAppTool(
    server,
    "next_event",
    {
      title: "Vibehuus next event",
      description:
        "Show Vibehuus' next event in an interactive panel (title, date, venue).",
      inputSchema: {},
      _meta: { ui: { resourceUri: UI_RESOURCE_URI } },
    },
    async (): Promise<CallToolResult> => {
      return {
        content: [
          {
            type: "text",
            text: `Vibehuus next event: "${NEXT_EVENT.title}" on ${NEXT_EVENT.date} at ${NEXT_EVENT.venue}, ${NEXT_EVENT.city}.`,
          },
        ],
        structuredContent: NEXT_EVENT,
      };
    },
  );

  // The interactive panel (single-file HTML bundle).
  registerAppResource(
    server,
    UI_RESOURCE_URI,
    UI_RESOURCE_URI,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "mcp-app.html"),
        "utf-8",
      );
      return {
        contents: [
          { uri: UI_RESOURCE_URI, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      };
    },
  );

  // The official MCP Apps documentation, fetched live as markdown so the agent
  // can read it when answering questions about how MCP UI works.
  server.registerResource(
    "mcp-apps-docs",
    DOCS_URI,
    {
      title: "MCP Apps documentation",
      description:
        "Official Model Context Protocol documentation for the MCP Apps (MCP UI) feature.",
      mimeType: "text/markdown",
    },
    async (): Promise<ReadResourceResult> => {
      const markdown = await fetchDocs();
      return {
        contents: [
          { uri: DOCS_URI, mimeType: "text/markdown", text: markdown },
        ],
      };
    },
  );

  return server;
}
