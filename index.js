import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * TEST ROUTE (WAJIB ADA)
 */
app.get("/", (req, res) => {
  res.json({ status: "Backend OK" });
});

/**
 * ANALYZE ROUTE (INI YANG DIPAKAI FRONTEND)
 */
app.post("/analyze", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({ error: "Idea is required" });
    }

    const prompt = `
Anda adalah analis bisnis startup.
Analisis ide bisnis berikut secara tajam dan terstruktur:

IDE:
"${idea}"

Berikan output dengan format:
1. Ringkasan Ide
2. Masalah yang Diselesaikan
3. Target Pasar
4. Keunggulan & Diferensiasi
5. Risiko Utama
6. Rekomendasi MVP (30 hari)
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;

    // 🔥 PENTING: return HARUS field "result"
    res.json({ result });

  } catch (error) {
    console.error("ANALYZE ERROR:", error);
    res.status(500).json({
      error: "AI processing failed",
      detail: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
