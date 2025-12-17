import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ====== HEALTH CHECK ======
app.get("/", (req, res) => {
  res.json({ status: "Backend OK" });
});

// ====== ANALYZE INITIAL ======
app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) {
      return res.status(400).json({ error: "Idea is required" });
    }

    const prompt = `
Anda adalah konsultan bisnis UMKM Indonesia.

Dari ide bisnis berikut:
"${idea}"

Buatkan:
1. Ringkasan Ide (singkat, jelas)
2. Masalah Utama yang Diselesaikan
3. Target Pasar Spesifik

Jawaban HARUS format JSON:
{
  "ringkasan": "...",
  "masalah": "...",
  "target": "..."
}
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      })
    });

    const aiData = await aiRes.json();
    const text = aiData.choices[0].message.content;
    const parsed = JSON.parse(text);

    res.json(parsed);

  } catch (err) {
    console.error("INITIAL ERROR:", err);
    res.status(500).json({ error: "Analyze initial failed" });
  }
});

// ====== ANALYZE FINAL ======
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target } = req.body;

    const prompt = `
Anda adalah mentor startup dan UMKM.

Gunakan data berikut (SUDAH disetujui user):

Ringkasan Ide:
${ringkasan}

Masalah:
${masalah}

Target Pasar:
${target}

Buatkan:
1. Analisis kelayakan bisnis (ringkas tapi tajam)
2. Risiko utama
3. Rekomendasi aksi konkret 30 hari pertama (CTA)

Format teks rapi, mudah dibaca.
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const aiData = await aiRes.json();
    const result = aiData.choices[0].message.content;

    res.json({ result });

  } catch (err) {
    console.error("FINAL ERROR:", err);
    res.status(500).json({ error: "Analyze final failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
