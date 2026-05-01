// EA Toolkit — Cloudflare Worker proxy for the Anthropic API.
//
// Endpoint: POST /generate
// Input:    { prompt: string }
// Output:   { text: string } | { error: string, status: number }
//
// The Anthropic API key is read from env.ANTHROPIC_API_KEY (set via
// `wrangler secret put ANTHROPIC_API_KEY`). The browser never sees it.

const ALLOWED_ORIGIN = "https://lisaesterhuizen0-wq.github.io";
const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const MAX_PROMPT_CHARS = 20000;
const MAX_OUTPUT_TOKENS = 2048;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed", status: 405 }, 405);
    }

    const url = new URL(request.url);
    if (url.pathname !== "/generate") {
      return jsonResponse({ error: "Not found", status: 404 }, 404);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse(
        { error: "Worker is missing the ANTHROPIC_API_KEY secret.", status: 500 },
        500,
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body.", status: 400 }, 400);
    }

    const prompt = body?.prompt;
    if (typeof prompt !== "string" || !prompt.trim()) {
      return jsonResponse({ error: "Missing 'prompt' field.", status: 400 }, 400);
    }
    if (prompt.length > MAX_PROMPT_CHARS) {
      return jsonResponse(
        { error: `Prompt too long (max ${MAX_PROMPT_CHARS} chars).`, status: 413 },
        413,
      );
    }

    let upstream;
    try {
      upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          messages: [{ role: "user", content: prompt }],
        }),
      });
    } catch {
      return jsonResponse(
        { error: "Network error reaching Anthropic. Try again shortly.", status: 502 },
        502,
      );
    }

    if (!upstream.ok) {
      const status = upstream.status;
      let detail = "";
      try {
        const errJson = await upstream.json();
        detail = errJson?.error?.message || "";
      } catch {
        /* ignore */
      }
      const message =
        status === 429 ? "Rate limited — please wait a moment and try again."
        : status >= 500 ? "Anthropic API is temporarily unavailable. Please try again shortly."
        : `Upstream error (${status})${detail ? `: ${detail}` : ""}`;
      return jsonResponse({ error: message, status }, status);
    }

    const data = await upstream.json();
    const text = data?.content?.[0]?.text;
    if (typeof text !== "string") {
      return jsonResponse(
        { error: "Unexpected upstream response shape.", status: 502 },
        502,
      );
    }

    return jsonResponse({ text });
  },
};
