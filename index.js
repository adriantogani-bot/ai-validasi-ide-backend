import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.json({ status: "Backend AI Validasi Ide UMKM aktif" });
});

/* ===============================
   ANALISIS AWAL
================================ */
app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length < 10) {
      return res.status(400).json({ error: "Ide bisnis terlalu singkat" });
    }

    const prompt = `
Anda adalah konsultan bisnis UMKM Indonesia.

ANALISISLAH ide bisnis berikut secara SPESIFIK dan KONKRET,
bukan normatif, bukan generik.

IDE BISNIS:
"${idea}"

Tugas Anda:
1. Buat RINGKASAN IDE yang mencerminkan ide DI ATAS, bukan template umum.
2. Identifikasi MASALAH NYATA yang dihadapi calon pelanggan ide ini.
3. Tentukan TARGET PASAR secara spesifik (siapa, konteks, perilaku).

Gunakan bahasa Indonesia.
JANGAN menggunakan kalimat umum seperti:
"monetisasi kebutuhan spesifik", "pasar belum terlayani", dll.

Format JSON WAJIB:
{
  "ringkasan": "...",
  "masalah": "...",
  "target_pasar": "..."
}
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const aiJson = await aiRes.json();
    const raw = aiJson.choices?.[0]?.message?.content;

    const parsed = JSON.parse(raw);

    res.json(parsed);

  } catch (err) {
    console.error("INITIAL ERROR:", err);
    res.status(500).json({ error: "Analyze initial failed" });
  }
});

/* ===============================
   ANALISIS FINAL
================================ */
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target_pasar } = req.body;

    const prompt = `
Anda adalah mentor bisnis UMKM berpengalaman.

DATA BISNIS:
Ringkasan Ide:
"${ringkasan}"

Masalah:
"${masalah}"

Target Pasar:
"${target_pasar}"

Tugas Anda:
1. Nilai KELAYAKAN bisnis ini (realistis / berisiko / tidak layak).
2. Berikan ANALISIS LOGIS berbasis konteks ide di atas.
3. Berikan 4–6 REKOMENDASI AKSI NYATA & operasional.

HINDARI bahasa normatif & motivasional.

Format output:
KESIMPULAN KELAYAKAN:
...

ANALISIS:
...

REKOMENDASI AKSI:
1. ...
2. ...
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const aiJson = await aiRes.json();
    const finalText = aiJson.choices?.[0]?.message?.content;

    res.json({ final_analysis: finalText });

  } catch (err) {
    console.error("FINAL ERROR:", err);
    res.status(500).json({ error: "Analyze final failed" });
  }
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
