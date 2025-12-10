export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    // Allow quick debug via GET?message=hello in browser (optional)
    if (req.method === "GET") {
      const url = new URL(req.url);
      const msg = url.searchParams.get("message");
      if (msg) {
        return new Response(JSON.stringify({ reply: "Quick test mode: message received: " + msg }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ error: "Only POST requests allowed. Use POST with JSON {\"message\":\"...\"}." }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST requests allowed." }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    let body = null;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid or empty JSON body. Send { \"message\": \"...\" }" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const userMessage = (body && body.message) ? body.message : "";
    const model = body.model || "gemini-1.5-flash";

    if (!userMessage) {
      return new Response(JSON.stringify({ error: "Empty message. Provide { \"message\": \"...\" } in the POST body." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // call Gemini (example) — adjust to the client you used earlier
    // Keep your existing genAI code here. Example placeholder:
    const genAI = new (await import("@google/generative-ai")).GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelObj = genAI.getGenerativeModel({ model });
    const result = await modelObj.generateContent(userMessage);
    const text = result.response?.text?.() ?? "";

    return new Response(JSON.stringify({ reply: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
