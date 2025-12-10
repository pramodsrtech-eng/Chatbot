import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const { message } = req.body;
    const result = await model.generateContent(message);
    const text = result.response.text();

    res.status(200).json({ reply: text });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
