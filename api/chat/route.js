// api/chat/route.js  (Next-style handler / simple Node handler)
import { GoogleGenerativeAI } from "@google/generative-ai"; // keep if you used SDK

export default async function handler(req, res) {
  try {
    // support both GET ?message= and POST { "message": "..." }
    const message = (req.method === "GET")
      ? (req.query && req.query.message) || ""
      : (req.body && (req.body.message || req.body)) || "";

    if (!message) {
      return res.status(400).json({ error: "No message provided. Use ?message= or POST JSON {message:'...'}" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY env var" });

    // === Option A: If you want to use the official Google SDK (ensure package matches usage) ===
    // const genAI = new GoogleGenerativeAI({ apiKey }); // adjust if your SDK expects object
    // const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "REPLACE_WITH_VALID_MODEL" });
    // const result = await model.generateContent({ prompt: message });
    // const text = result?.response?.text?.() ?? result?.text ?? JSON.stringify(result);

    // === Option B: Simple REST call (works reliably). Replace MODEL_NAME with one from ListModels ===
    const MODEL_NAME = process.env.GEMINI_MODEL; // set this in Vercel after you list models
    if (!MODEL_NAME) return res.status(500).json({ error: "No model set. Add GEMINI_MODEL env var (see docs)" });

    const url = `https://generativelanguage.googleapis.com/v1/${MODEL_NAME}:generateText?key=${apiKey}`;

    // request body per Google generateText API (simple text prompt)
    const body = {
      // use textContent / prompt format depending on model; this is a compatible simple payload:
      input: message
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: result });
    }
    // Extract textual answer (structure can vary; inspect the result if different)
    const reply = result?.candidates?.[0]?.output || result?.text || result?.output?.[0]?.content || result;
    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || err });
  }
}
