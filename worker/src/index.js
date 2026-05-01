// Cloudflare Worker — placeholder. Real proxy code lands in step 3.
//
// Endpoint: POST /generate
// Input:    { prompt: string }
// Output:   { text: string } | { error: string, status: number }
// CORS:     locked to https://lisaesterhuizen0-wq.github.io (no wildcard)
// Secret:   ANTHROPIC_API_KEY (set via `wrangler secret put`)

export default {
  async fetch() {
    return new Response("EA Toolkit Worker — not yet implemented.", { status: 501 });
  },
};
