import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ===============================
   MIDDLEWARE (WAJIB URUTAN INI)
================================ */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "1mb" }));

/* ===============================
   OPENAI CLIENT
================================ */
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY TIDAK ADA");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend AI Validasi Ide aktif"
  });
});

/* ===============================
   ANALYZE ENDPOINT (INI YANG DIPAKAI FRONTEND)
================================ */
app.post("/api/analyze", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length < 10) {
      return res.status(400).json({
        error: "Ide bisnis terlalu pendek"
      });
    }

    const prompt = `
Anda adalah konsultan bisnis UMKM Indonesia.

Analisis ide bisnis berikut secara mendalam dan praktis:

"${idea}"

Gunakan struktur berikut:

1. Ringkasan Ide
2. Masalah yang Diselesaikan
3. Target Pasar
4. Keunggulan & Diferensiasi
5. Risiko Utama
6. Validasi Cepat (MVP)
7. Rekomendasi Aksi Nyata (Call To Action)

Gunakan bahasa Indonesia yang jelas, lugas, dan aplikatif.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Anda adalah konsultan bisnis berpengalaman." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    const result = completion.choices[0].message.content;

    return res.json({ result });

  } catch (error) {
    console.error("❌ ERROR ANALYZE:", error.message);
    return res.status(500).json({
      error: "Gagal memproses analisis AI"
    });
  }
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
