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
 * STEP 1: Generate Draft (Ringkasan, Masalah, Target)
 */
app.post("/draft", async (req, res) => {
  try {
    const { idea, location, target, price } = req.body;

    const prompt = `
Anda adalah analis bisnis UMKM Indonesia.

Buatkan DRAFT AWAL dalam format JSON dengan struktur:
{
  "ringkasan_ide": "...",
  "masalah_yang_disediakan": "...",
  "target_pasar": "..."
}

Ide Bisnis:
- Ide: ${idea}
- Lokasi: ${location}
- Target awal: ${target}
- Harga: ${price}

Gunakan bahasa lugas dan mudah dipahami UMKM.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const text = completion.choices[0].message.content;
    res.json({ draft: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal membuat draft" });
  }
});

/**
 * STEP 2: Final Analysis (SETELAH DISETUJUI USER)
 */
app.post("/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target } = req.body;

    const prompt = `
Anda adalah konsultan bisnis UMKM senior.

Lakukan ANALISA MENDALAM berdasarkan poin yang SUDAH DISETUJUI user berikut:

Ringkasan Ide:
${ringkasan}

Masalah yang Diselesaikan:
${masalah}

Target Pasar:
${target}

Berikan:
1. Analisis pasar
2. Analisis kompetitor
3. Risiko utama
4. Rekomendasi aksi
5. Call To Action (apa langkah berikutnya)

Gunakan bahasa lugas, jujur, dan praktis.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    res.json({
      analysis: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal analisa final" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend Approval Flow Aktif");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
