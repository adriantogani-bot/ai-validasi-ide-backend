import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("Backend AI Validasi Ide UMKM aktif");
});

// ===== ANALISIS AWAL =====
app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;

    const prompt = `
Anda adalah konsultan bisnis UMKM Indonesia.

Berdasarkan ide bisnis berikut:
"${idea}"

Buatkan:
1. Ringkasan Ide (singkat & jelas)
2. Masalah yang Diselesaikan
3. Target Pasar

Gunakan format:
### Ringkasan Ide
### Masalah yang Diselesaikan
### Target Pasar
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    res.json({
      result: completion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal analisis awal" });
  }
});

// ===== ANALISIS FINAL SETELAH PERSETUJUAN =====
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { summary, problem, target } = req.body;

    const prompt = `
Anda adalah konsultan bisnis UMKM Indonesia.

Gunakan data yang TELAH DISETUJUI user berikut:

Ringkasan Ide:
${summary}

Masalah yang Diselesaikan:
${problem}

Target Pasar:
${target}

Buatkan analisis lanjutan:
1. Keunggulan & Diferensiasi
2. Risiko & Tantangan
3. Validasi Cepat (MVP)
4. Rekomendasi Aksi Nyata (Call to Action 7 hari ke depan)

Gunakan bahasa lugas & aplikatif.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    res.json({
      result: completion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal analisis final" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend berjalan di port", PORT);
});
