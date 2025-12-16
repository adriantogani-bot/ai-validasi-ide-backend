import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 10000;

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Debug awal =====
console.log("🚀 Server starting...");
console.log("🔑 OPENAI KEY exists:", !!process.env.OPENAI_API_KEY);

// ===== OpenAI Client =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===== Health Check =====
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "AI Validasi Ide Backend is running",
  });
});

// ===== MAIN ANALYSIS ENDPOINT =====
app.post("/analyze", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length < 10) {
      return res.status(400).json({
        error: "Ide bisnis terlalu pendek",
      });
    }

    console.log("📥 Idea received:", idea);

    // ===== PROMPT BERJENJANG =====
    const prompt = `
Anda adalah konsultan bisnis senior.

Analisis ide bisnis berikut secara TAJAM dan STRUKTURAL:

IDE BISNIS:
"${idea}"

Berikan analisis dengan format berikut:

### 1. Ringkasan Kelayakan
(1 paragraf singkat)

### 2. Masalah Nyata yang Diselesaikan
- poin-poin jelas

### 3. Target Pasar
- Segmen utama
- Daya beli
- Perilaku

### 4. Keunggulan Utama
- Differentiator
- Value proposition

### 5. Risiko & Tantangan
- Operasional
- Pasar
- Regulasi

### 6. Validasi Cepat (MVP)
- Cara uji pasar dalam 30 hari

Gunakan bahasa Indonesia yang lugas dan profesional.
`;

    // ===== OpenAI Call =====
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "Anda adalah analis bisnis profesional." },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
    });

    const result = completion.choices[0].message.content;

    console.log("✅ Analysis generated");

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("❌ ERROR:", error.message);

    res.status(500).json({
      error: "Gagal menganalisis ide",
      detail: error.message,
    });
  }
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
