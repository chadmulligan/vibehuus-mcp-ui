---
title: Vibehuus MCP UI
emoji: 🪟
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Vibehuus MCP UI

A remote MCP server (Streamable HTTP) that ships an interactive MCP App panel.

- **`next_event` tool** → opens a panel showing Vibehuus' next event. The panel
  has a button that sends a question to the agent (via `sendMessage`) asking how
  MCP UI works.
- **`mcp-apps-docs` resource** → the official MCP Apps documentation, fetched
  live as markdown, so the agent can ground its answer.

Endpoint: `https://<user>-<space>.hf.space/mcp` · Auth: none · Secrets: none.

## Local dev

```bash
npm install
npm run dev      # build UI + serve HTTP on :3001
# or: npm run serve:stdio   # stdio transport for Claude Desktop
```
