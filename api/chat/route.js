// api/chat/route.js
export const config = { runtime: "edge" };

const MODEL_ID = "gemini-1.5-flash-latest";

async function callGenerate(apiKey, modelId, userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${apiKey}`;

  const payload = {
    // minimal text input for the REST generateContent endpoint
    text: userMessage
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: { text: userMessage } })
  });

  // return parsed JSON or throw if non-JSON
  const txt = await res.text();
  let j = null;
  try { j = JSON.parse(txt); } catch(e) { /* not JSON */ }
  return { ok: res.ok, status: res.status, text: txt, json: j };
}

export default async function handler(req) {
  try {
    // GET quick test: /api/chat?message=hello
    if (req.method === "GET") {
      const url = new URL(req.url);
      const m = url.searchParams.get("message");
      if (m) return new Response(JSON.stringify({ reply: `Quick test mode: ${m}` }), { status: 200, headers: { "Content-Type": "application/json" }});
      return new Response(JSON.stringify({ error: "Only POST allowed. Send JSON { \"message\": \"...\" }" }), { status: 405, headers: { "Content-Type": "application/json" }});
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" }});
    }

    // parse body safely
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid or empty JSON body. Send { \"message\": \"...\" }" }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    const userMessage = (body && body.message) ? String(body.message) : "";
    if (!userMessage) {
      return new Response(JSON.stringify({ error: "Empty message. Provide { \"message\": \"...\" }" }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY in environment variables" }), { status: 500, headers: { "Content-Type": "application/json" }});
    }

    // call REST API
    const result = await callGenerate(API_KEY, MODEL_ID, userMessage);

    if (!result.ok) {
      // include helpful debug info
      return new Response(JSON.stringify({ error: `Model call failed (${result.status})`, body: result.json ?? result.text }), { status: 500, headers: { "Content-Type": "application/json" }});
    }

    // The response JSON structure may vary. Try to extract a clear text reply.
    // Check common shapes: candidates[0].output or candidates[0].content.text
    let reply = null;
    const j = result.json;
    if (j) {
      if (Array.isArray(j.candidates) && j.candidates.length > 0) {
        // try multiple places
        const c = j.candidates[0];
        reply = c?.content?.[0]?.text ?? c?.content?.text ?? c?.output ?? c?.text ?? null;
      }
      // fallback: some responses put text under "output" or "reply"
      if (!reply) reply = j?.output?.[0]?.content?.text ?? j?.reply ?? j?.content?.text ?? null;
    }
    if (!reply) reply = (typeof result.text === "string" && result.text.length < 2000) ? result.text : "No text reply from model.";

    return new Response(JSON.stringify({ reply }), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}
