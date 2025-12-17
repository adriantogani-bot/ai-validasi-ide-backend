import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/* ===============================
   ANALYZE INITIAL
================================ */
app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length < 10) {
      return res.status(400).json({ error: "Idea terlalu pendek" });
    }

    const prompt = `
Analisis singkat ide bisnis berikut untuk UMKM Indonesia.

Ide:
${idea}

Berikan hasil dalam TEKS BIASA (bukan JSON), dengan struktur:

Ringkasan Ide:
Masalah yang Diselesaikan:
Target Pasar:
    `.trim();

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const aiData = await aiRes.json();

    const text =
      aiData?.choices?.[0]?.message?.content ||
      "AI tidak mengembalikan hasil";

    res.json({
      analysis_text: text
    });

  } catch (err) {
    console.error("INITIAL ERROR:", err);
    res.status(500).json({ error: "Analyze initial failed" });
  }
});

/* ===============================
   ANALYZE FINAL
================================ */
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target_pasar } = req.body;

    const prompt = `
Buat analisis kelayakan bisnis UMKM berdasarkan data berikut:

Ringkasan:
${ringkasan}

Masalah:
${masalah}

Target Pasar:
${target_pasar}

Berikan:
1. Kesimpulan Kelayakan
2. Risiko Utama
3. Rekomendasi Aksi Nyata
    `.trim();

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const aiData = await aiRes.json();

    const text =
      aiData?.choices?.[0]?.message?.content ||
      "AI tidak mengembalikan hasil";

    res.json({
      final_analysis: text
    });

  } catch (err) {
    console.error("FINAL ERROR:", err);
    res.status(500).json({ error: "Analyze final failed" });
  }
});

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("AI Validasi Ide Backend OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
