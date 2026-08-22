/**
 * Helper to construct and normalize the WebSocket URL for the AI review endpoint.
 * Automatically resolves http/https to ws/wss protocols and ensures the endpoint path is correct.
 */
export function getWebSocketUrl(): string {
  let envUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();

  if (!envUrl) {
    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      return "wss://codeauditai-pd2i.onrender.com/api/ws/review";
    }
    return "ws://localhost:8000/api/ws/review";
  }

  // Auto-correct protocol: https -> wss, http -> ws
  if (envUrl.startsWith("https://")) {
    envUrl = "wss://" + envUrl.slice(8);
  } else if (envUrl.startsWith("http://")) {
    envUrl = "ws://" + envUrl.slice(7);
  } else if (!envUrl.startsWith("ws://") && !envUrl.startsWith("wss://")) {
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    envUrl = (isHttps ? "wss://" : "ws://") + envUrl;
  }

  // Ensure path points to /api/ws/review if only host or base URL was provided
  try {
    const dummyUrl = new URL(envUrl.replace(/^ws/, "http"));
    if (dummyUrl.pathname === "/" || dummyUrl.pathname === "") {
      dummyUrl.pathname = "/api/ws/review";
    }
    const protocol = envUrl.startsWith("wss://") ? "wss:" : "ws:";
    return `${protocol}//${dummyUrl.host}${dummyUrl.pathname}${dummyUrl.search}`;
  } catch {
    return envUrl;
  }
}
