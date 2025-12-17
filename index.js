import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   MIDDLEWARE (WAJIB URUTAN)
========================= */
app.use(cors());
app.use(express.json({ limit: "1mb" })); // ⬅️ PENTING

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "AI Validasi Ide Backend is running"
  });
});

/* =========================
   ANALISIS AWAL (STEP 1)
========================= */
app.post("/api/analyze-initial", async (req, res) => {
  try {
    console.log("REQUEST BODY:", req.body);

    const { idea } = req.body;

    if (!idea || typeof idea !== "string") {
      return res.status(400).json({
        error: "Field 'idea' wajib diisi dan harus string"
      });
    }

    const prompt = `
Anda adalah konsultan bisnis UMKM Indonesia.

Tugas:
Buatkan analisis awal ide bisnis berikut dengan format JSON:

{
  "ringkasan": "...",
  "masalah": "...",
  "target_pasar": "..."
}

Ide bisnis:
${idea}
`;

    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4
        })
      }
    );

    const aiData = await aiResponse.json();

    if (!aiData.choices) {
      console.error("AI RAW RESPONSE:", aiData);
      return res.status(500).json({ error: "AI response invalid" });
    }

    const text = aiData.choices[0].message.content;

    // AMAN: ambil JSON saja
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "JSON tidak ditemukan di response AI" });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    res.json(parsed);

  } catch (err) {
    console.error("INITIAL ERROR:", err);
    res.status(500).json({ error: "Analyze initial failed" });
  }
});

/* =========================
   ANALISIS FINAL (STEP 2)
========================= */
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target_pasar } = req.body;

    if (!ringkasan || !masalah || !target_pasar) {
      return res.status(400).json({ error: "Data approval tidak lengkap" });
    }

    const prompt = `
Anda adalah konsultan bisnis senior.

Gunakan data berikut untuk analisis lanjutan + rekomendasi aksi:

Ringkasan:
${ringkasan}

Masalah:
${masalah}

Target Pasar:
${target_pasar}

Berikan:
1. Kelayakan bisnis
2. Risiko utama
3. Rekomendasi aksi 30 hari
4. Call To Action konkret
`;

    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5
        })
      }
    );

    const aiData = await aiResponse.json();

    if (!aiData.choices) {
      return res.status(500).json({ error: "AI error" });
    }

    res.json({
      result: aiData.choices[0].message.content
    });

  } catch (err) {
    console.error("FINAL ERROR:", err);
    res.status(500).json({ error: "Analyze final failed" });
  }
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
