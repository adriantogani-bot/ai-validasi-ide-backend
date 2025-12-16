import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 10000;

// ✅ CORS WAJIB (INI KRUSIAL)
app.use(cors({
  origin: "*", // sementara pakai wildcard dulu
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ANALYZE ROUTE
app.post("/analyze", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({ error: "Idea is required" });
    }

    const prompt = `
Anda adalah analis bisnis profesional.

Analisis ide bisnis berikut secara tajam dan terstruktur:

"${idea}"

Gunakan format:
1. Riset Pasar
2. Segmentasi Pasar
3. Keunggulan Kompetitif
4. Risiko & Tantangan
5. Strategi MVP
6. Rekomendasi Langkah Selanjutnya
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    res.json({
      result: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
