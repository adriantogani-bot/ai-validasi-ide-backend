import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 10000;

// ===== MIDDLEWARE =====
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));
app.use(express.json());

// ===== DEBUG ENV =====
console.log("OPENAI KEY exists:", !!process.env.OPENAI_API_KEY);

// ===== OPENAI CLIENT =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("AI Validasi Ide Backend is running 🚀");
});

// ===== MAIN ANALYSIS ENDPOINT =====
app.post("/analyze", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({ error: "Idea is required" });
    }

    const prompt = `
Anda adalah analis bisnis profesional.

Lakukan analisis kelayakan ide bisnis berikut secara TERSTRUKTUR dan TAJAM:

Ide bisnis:
"${idea}"

Gunakan format berikut:

### 1. Masalah yang Diselesaikan
### 2. Target Pasar
### 3. Keunggulan Utama
### 4. Risiko & Tantangan
### 5. Validasi Cepat (MVP)
### 6. Rekomendasi Langkah Selanjutnya
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Anda adalah analis bisnis berpengalaman." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;

    res.json({ result });

  } catch (error) {
    console.error("ANALYZE ERROR:", error);
    res.status(500).json({ error: "Failed to analyze idea" });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
