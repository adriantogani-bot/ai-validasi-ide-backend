import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check (WAJIB ADA)
app.get("/", (req, res) => {
  res.json({ status: "Backend OK" });
});

// === API ANALYZE (INI YANG TADI HILANG) ===
app.post("/api/analyze", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim() === "") {
      return res.status(400).json({ error: "Idea is required" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Anda adalah konsultan bisnis UMKM Indonesia.

Analisis ide bisnis berikut secara mendalam dan praktis:

"${idea}"

Berikan output dengan struktur:
1. Ringkasan Ide
2. Masalah yang Diselesaikan
3. Target Pasar
4. Keunggulan & Diferensiasi
5. Risiko & Tantangan
6. Rekomendasi Langkah Nyata (CTA 30 hari)
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Anda adalah analis bisnis profesional." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    res.json({
      result: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
