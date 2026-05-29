# Project Rules

## Philosophy
- Simplest solution first. Get it working, then improve.
- Don't over-engineer. One file is fine until it's painful.
- Flat is better than nested.

## Engineering Principles
- Write modular code — each function does one thing
- DRY (Don't Repeat Yourself) — if you write it twice, make it a function
- Separation of concerns — keep UI, logic, and data separate
- Fail gracefully — handle errors where they happen
- Make it testable — no hidden dependencies or global state

## Code Style
- Descriptive variable names (no single letters except i, j in loops)
- Short functions — if it scrolls, split it

## Stack
- Runtime: Node 20+, TypeScript
- MCP: `@modelcontextprotocol/ext-apps`, `@modelcontextprotocol/sdk`
- UI: React 19, Vite, `vite-plugin-singlefile` (single-file HTML bundle)
- AI: Gemini 3 Flash Preview via `@google/genai` for transcription + structured summary
- Local models: Ollama via `fetch` on `http://localhost:11434`
- Tests: vitest

## UI (MCP App)
- Single React entry: `src/mcp-app.tsx`
- Use the `useApp` hook from `@modelcontextprotocol/ext-apps/react`
- Register ALL handlers inside `onAppCreated` so they fire before `App.connect()`
- Apply theme/style/font via `applyDocumentTheme`, `applyHostStyleVariables`, `applyHostFonts` in a `useEffect` keyed on `hostContext`
- Style via host CSS variables (`var(--color-background-primary)`, `var(--font-sans)`, etc.) with sane fallbacks in `src/global.css`
- Use `.tsx` for React components, `.ts` for non-JSX helpers and types

## Server (MCP)
- The MCP server is the backend. No separate FastAPI/HTTP API.
- `server.ts` registers tools and resources with `registerAppTool` and `registerAppResource` (positional signatures)
- `main.ts` wires transports: stdio (for Claude Desktop) and Streamable HTTP (for `basic-host` testing)
- All I/O is async/await (Gemini SDK, Ollama fetches, file reads)
- Hide UI-driven helper tools from the model with `_meta: { ui: { visibility: ["app"] } }`
- Always include a `content: [{ type: "text", text: ... }]` text fallback alongside `structuredContent`

## Libraries
- Add deps via `npm install <pkg>` so npm resolves the latest compatible version
- Never hardcode version numbers from memory
- Commit `package-lock.json`
- No abandoned libraries (2+ years no updates)

## Testing
- Run tests with `npm test` (vitest)
- Add tests for non-trivial logic: parsers, schema mappers, URL validators
- Cover happy path, edge cases, and error cases — one behavior per test
- Skip tests for pure UI rendering or thin SDK wrappers
- Name tests clearly: `describe("functionName", ...)` with intent in the `it` string

## Don'ts
- Don't add features I didn't ask for
- Don't create unnecessary classes or abstractions
- Don't split into multiple files unless necessary
- Don't leave unused imports
- Don't use deprecated methods
- Don't write code without a matching test for core logic

## Before Finishing
- Confirm all imports are used (`tsc --noEmit` catches this with `noUnusedLocals`)
- Confirm all libraries are current
- Remove commented-out code
- Run `npm test` — all should pass
- Run `npm run build` — must produce `dist/main.js` and `dist/mcp-app.html` clean

## When Unsure
- Ask me — don't guess
- Show me what you're about to change before changing it
- If fixing a bug, explain the root cause first
