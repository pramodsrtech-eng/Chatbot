export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    // QUICK GET helper: /api/chat?message=hello
    if (req.method === "GET") {
      const url = new URL(req.url);
      const m = url.searchParams.get("message");
      if (m) {
        return new Response(JSON.stringify({ reply: `Quick test mode: ${m}` }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Only POST allowed. Use POST with JSON {\"message\":\"...\"}" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Only accept POST from here on
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Safely parse JSON with try/catch
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid or empty JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userMessage = body?.message || "";
    if (!userMessage) {
      return new Response(JSON.stringify({ error: "Empty message" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // === CALL GEMINI (example) ===
    // Keep this part as your working client. If you used @google/generative-ai,
    // ensure it's in package.json and Vercel installed it. Example placeholder:
    // const { GoogleGenerativeAI } = await import("@google/generative-ai");
    // const gen = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = gen.getGenerativeModel({ model: "gemini-1.5-flash" });
    // const result = await model.generateContent(userMessage);
    // const replyText = result.response?.text?.() ?? "No reply";

    // For now return a placeholder (so we can confirm parsing works)
    const replyText = "placeholder reply (replace with Gemini call)";

    return new Response(JSON.stringify({ reply: replyText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

