import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({ status: "Backend AI Validasi Ide - OK" });
});

/* =========================
   STEP 1: GENERATE DRAFT
========================= */
app.post("/draft", async (req, res) => {
  try {
    const { idea, location } = req.body;

    if (!idea || !location) {
      return res.status(400).json({
        error: "idea dan location wajib diisi",
      });
    }

    const prompt = `
Anda adalah analis bisnis UMKM Indonesia.

Buatkan DRAF AWAL (belum analisis mendalam) berdasarkan ide berikut:

Ide Bisnis:
${idea}

Lokasi Target:
${location}

Output HARUS dalam format JSON dengan struktur:
{
  "ringkasan": "...",
  "masalah": "...",
  "targetPasar": "..."
}

Gunakan bahasa Indonesia yang lugas, sederhana, dan realistis.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const text = completion.choices[0].message.content;

    // parsing aman
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    res.json(parsed);
  } catch (error) {
    console.error("Draft error:", error);
    res.status(500).json({ error: "Gagal membuat draft AI" });
  }
});

/* =========================
   STEP 2: FINAL ANALYSIS
========================= */
app.post("/analyze", async (req, res) => {
  try {
    const { ringkasan, masalah, targetPasar } = req.body;

    if (!ringkasan || !masalah || !targetPasar) {
      return res.status(400).json({
        error: "ringkasan, masalah, dan targetPasar wajib diisi",
      });
    }

    const prompt = `
Anda adalah analis bisnis senior UMKM Indonesia.

Berikut adalah versi FINAL yang SUDAH DISETUJUI USER:

Ringkasan Ide:
${ringkasan}

Masalah yang Diselesaikan:
${masalah}

Target Pasar:
${targetPasar}

Lakukan ANALISIS MENDALAM dan berikan output TERSTRUKTUR
dengan format JSON berikut:

{
  "statusKelayakan": "Layak / Layak dengan Catatan / Tidak Layak",
  "skorPotensi": 0-100,
  "analisisPasar": "...",
  "analisisPersaingan": "...",
  "risikoUtama": ["...", "..."],
  "rekomendasiStrategis": ["...", "..."],
  "callToAction": "Langkah konkret yang harus dilakukan user selanjutnya"
}

Gunakan bahasa jujur, tidak menghibur, dan fokus pada keputusan bisnis.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const text = completion.choices[0].message.content;

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    res.json(parsed);
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Gagal melakukan analisis AI" });
  }
});

/* ========================= */
app.listen(port, () => {
  console.log(`Backend berjalan di port ${port}`);
});
