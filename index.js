import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 10000;

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Health Check =====
app.get("/", (req, res) => {
  res.send("AI Validasi Ide Backend is running 🚀");
});

// ===== OpenAI Client =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===== MAIN API =====
app.post("/api/analyze", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim() === "") {
      return res.status(400).json({ error: "Idea is required" });
    }

    const prompt = `
Anda adalah konsultan bisnis profesional.

Analisis ide bisnis berikut secara tajam dan terstruktur:

IDE BISNIS:
"${idea}"

Berikan output dengan format berikut:

### 1. Ringkasan Ide
### 2. Target Pasar
### 3. Kelebihan
### 4. Tantangan & Risiko
### 5. Validasi Pasar Cepat (MVP)
### 6. Rekomendasi Langkah Selanjutnya

Gunakan bahasa Indonesia yang lugas.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Anda adalah analis bisnis profesional." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;

    res.json({ result });
  } catch (error) {
    console.error("ERROR ANALYZE:", error);
    res.status(500).json({
      error: "Gagal memproses analisis",
      detail: error.message,
    });
  }
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
