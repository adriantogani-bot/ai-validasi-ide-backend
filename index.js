import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== OPENAI =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.json({ status: "Backend OK" });
});

// ===== ANALYZE ROUTE (INI YANG TADI HILANG) =====
app.post("/api/analyze", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({ error: "Idea is required" });
    }

    const prompt = `
Anda adalah analis bisnis senior.

Analisis ide bisnis berikut secara tajam dan terstruktur:

"${idea}"

Gunakan format berikut:

### 1. Ringkasan Ide
### 2. Target Pasar
### 3. Masalah yang Diselesaikan
### 4. Keunggulan Kompetitif
### 5. Risiko & Tantangan
### 6. Validasi Cepat (MVP)
### 7. Rekomendasi Langkah Selanjutnya
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    res.json({
      result: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

// ===== PORT (WAJIB SEPERTI INI DI RENDER) =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
