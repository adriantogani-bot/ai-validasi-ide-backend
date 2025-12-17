import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/* =========================
   ANALISIS AWAL
========================= */
app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea is required" });

    const prompt = `
Buat analisis awal ide bisnis UMKM berikut dalam format JSON:
{
  "ringkasan": "...",
  "masalah": "...",
  "target_pasar": "..."
}

Ide bisnis:
${idea}
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5
      })
    });

    const data = await aiRes.json();
    const content = data.choices[0].message.content;
    const json = JSON.parse(content);

    res.json(json);

  } catch (err) {
    console.error("INITIAL ERROR:", err);
    res.status(500).json({ error: "Analyze initial failed" });
  }
});

/* =========================
   ANALISIS FINAL (INI KUNCI)
========================= */
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target_pasar } = req.body;

    if (!ringkasan || !masalah || !target_pasar) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const prompt = `
Anda adalah konsultan bisnis UMKM senior.

Berdasarkan data yang SUDAH DISETUJUI pengguna berikut:

Ringkasan Ide:
${ringkasan}

Masalah yang Diselesaikan:
${masalah}

Target Pasar:
${target_pasar}

Berikan ANALISIS FINAL yang TAJAM dan PRAKTIS dengan struktur:

1. Penilaian kelayakan bisnis (layak / tidak layak + alasan)
2. Kekuatan utama ide ini
3. Risiko utama yang perlu diwaspadai
4. Rekomendasi aksi nyata 30 hari ke depan (bullet point)

Gunakan bahasa tegas, konkret, dan spesifik UMKM Indonesia.
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await aiRes.json();
    const finalAnalysis = data.choices[0].message.content;

    res.json({ final_analysis: finalAnalysis });

  } catch (err) {
    console.error("FINAL ERROR:", err);
    res.status(500).json({ error: "Analyze final failed" });
  }
});

/* ========================= */
app.get("/", (_, res) => res.send("Backend OK"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
