import { StrictMode, useEffect, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import {
  applyDocumentTheme,
  applyHostStyleVariables,
  applyHostFonts,
} from "@modelcontextprotocol/ext-apps";
import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import "./global.css";

type EventInfo = {
  title: string;
  date: string;
  venue: string;
  city: string;
};

const DOCS_URI = "https://modelcontextprotocol.io/extensions/apps/overview.md";

// Precise enough that the agent reads the docs resource and explains the
// mechanism end to end rather than giving a vague summary.
const EXPLAIN_PROMPT = `Explain how MCP UI (MCP Apps) actually works under the hood. First read the MCP server resource "${DOCS_URI}" (the official MCP Apps documentation), then walk me through, with concrete message flow:
1. How a tool links to a ui:// resource via _meta.ui.resourceUri and how the host preloads it.
2. The ui/initialize handshake between the app iframe and the host over postMessage.
3. The actions the app can send back — tools/call (callServerTool), sendMessage, updateModelContext, readServerResource — and which direction each flows.
4. The sandboxed-iframe security model and what it prevents.`;

function VibehuusApp() {
  const [event, setEvent] = useState<EventInfo>();
  const [hostContext, setHostContext] = useState<McpUiHostContext>();

  const { app, error: connectError } = useApp({
    appInfo: { name: "Vibehuus MCP UI", version: "0.1.0" },
    capabilities: {},
    onAppCreated: (a) => {
      a.ontoolresult = (result) => {
        setEvent(result.structuredContent as EventInfo);
      };
      a.onhostcontextchanged = (ctx) => {
        setHostContext((prev) => ({ ...prev, ...ctx }));
      };
      a.onerror = console.error;
      a.onteardown = async () => ({});
    },
  });

  useEffect(() => {
    if (app) setHostContext(app.getHostContext());
  }, [app]);

  useEffect(() => {
    if (hostContext?.theme) applyDocumentTheme(hostContext.theme);
    if (hostContext?.styles?.variables) {
      applyHostStyleVariables(hostContext.styles.variables);
    }
    if (hostContext?.styles?.css?.fonts) {
      applyHostFonts(hostContext.styles.css.fonts);
    }
  }, [hostContext]);

  const [asking, setAsking] = useState(false);
  const [asked, setAsked] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  if (connectError) return <div>Connection error: {connectError.message}</div>;
  if (!app) return <div>Connecting…</div>;

  async function handleAsk() {
    if (!app) return;
    setAskError(null);
    setAsking(true);
    try {
      const res = await app.sendMessage({
        role: "user",
        content: [{ type: "text", text: EXPLAIN_PROMPT }],
      });
      if (res.isError) throw new Error("The host rejected the message.");
      setAsked(true);
    } catch (e) {
      setAskError(e instanceof Error ? e.message : String(e));
    } finally {
      setAsking(false);
    }
  }

  const prettyDate = event
    ? new Date(event.date).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main
      style={{
        paddingTop: hostContext?.safeAreaInsets?.top,
        paddingRight: hostContext?.safeAreaInsets?.right,
        paddingBottom: hostContext?.safeAreaInsets?.bottom,
        paddingLeft: hostContext?.safeAreaInsets?.left,
      }}
    >
      <p style={kickerStyle}>Vibehuus · next event</p>

      {event ? (
        <section style={cardStyle}>
          <h1 style={titleStyle}>{event.title}</h1>
          <p style={metaStyle}>{prettyDate}</p>
          <p style={metaStyle}>
            {event.venue}, {event.city}
          </p>
        </section>
      ) : (
        <p style={metaStyle}>Loading event…</p>
      )}

      <button
        type="button"
        onClick={handleAsk}
        disabled={asking}
        style={buttonStyle}
      >
        {asking ? "Asking…" : "Ask the agent how MCP UI works"}
      </button>

      {asked && (
        <p style={metaStyle}>Sent to chat — see the agent's answer below.</p>
      )}
      {askError && <p style={errorStyle}>{askError}</p>}
    </main>
  );
}

const kickerStyle: CSSProperties = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: "0.75rem",
  color: "var(--color-text-muted)",
};

const cardStyle: CSSProperties = {
  marginTop: 8,
  padding: 16,
  background: "var(--color-background-secondary)",
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--border-radius-md)",
};

const titleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "1.25rem",
};

const metaStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "var(--color-text-secondary)",
};

const buttonStyle: CSSProperties = {
  marginTop: 16,
  padding: "8px 16px",
  background: "var(--color-accent)",
  color: "var(--color-text-on-accent)",
  border: "1px solid var(--color-accent)",
  borderRadius: "var(--border-radius-md)",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "inherit",
};

const errorStyle: CSSProperties = { color: "#dc2626", marginTop: 12 };

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VibehuusApp />
  </StrictMode>,
);
