import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/* ===== DEBUG START ===== */
console.log("ENV CHECK:", {
  hasOpenAIKey: !!OPENAI_API_KEY,
});
/* ===== DEBUG END ===== */

app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({ error: "Idea is required" });
    }

    console.log("Analyze initial called with idea:", idea);

    const prompt = `
Anda adalah konsultan bisnis UMKM Indonesia.

Tugas Anda:
Buatkan 3 bagian berikut dalam format JSON MURNI:

{
  "ringkasan": "...",
  "masalah": "...",
  "target": "..."
}

IDE BISNIS:
${idea}
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const rawText = await openaiRes.text();
    console.log("RAW OPENAI RESPONSE:", rawText);

    if (!openaiRes.ok) {
      throw new Error("OpenAI API error");
    }

    const parsed = JSON.parse(rawText);
    const content = parsed.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }

    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}");
    const jsonString = content.slice(jsonStart, jsonEnd + 1);

    const result = JSON.parse(jsonString);

    return res.json(result);

  } catch (err) {
    console.error("ANALYZE INITIAL ERROR:", err);
    return res.status(500).json({
      error: "Analyze initial failed",
      detail: err.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
