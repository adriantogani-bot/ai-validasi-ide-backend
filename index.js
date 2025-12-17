import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/* =============================
   ANALISIS AWAL
============================= */
app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length < 10) {
      return res.status(400).json({ error: "Ide bisnis tidak valid" });
    }

    const prompt = `
Anda adalah konsultan bisnis UMKM berpengalaman di Indonesia.

Analisislah IDE BISNIS berikut secara SPESIFIK dan KONTEKSTUAL,
bukan dengan kalimat umum atau template.

IDE BISNIS:
"${idea}"

Buatkan hasil dengan format berikut (WAJIB):

Ringkasan Ide:
Jelaskan ulang ide bisnis ini dengan bahasa yang lebih tajam dan konkret,
menyebutkan produk/jasa, cara kerja, dan nilai uniknya.

Masalah Utama:
Masalah nyata apa yang dihadapi target pasar dan mengapa solusi ini relevan.

Target Pasar:
Siapa target pasar yang PALING masuk akal (usia, perilaku, kebutuhan).

Gunakan bahasa Indonesia yang lugas, praktis, dan tidak normatif.
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
        temperature: 0.4
      })
    });

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // parsing sederhana tapi aman
    const ringkasan =
      content.match(/Ringkasan Ide:\s*([\s\S]*?)Masalah Utama:/)?.[1]?.trim() || "";
    const masalah =
      content.match(/Masalah Utama:\s*([\s\S]*?)Target Pasar:/)?.[1]?.trim() || "";
    const target_pasar =
      content.match(/Target Pasar:\s*([\s\S]*)$/)?.[1]?.trim() || "";

    res.json({
      ringkasan,
      masalah,
      target_pasar
    });

  } catch (err) {
    console.error("INITIAL ERROR:", err);
    res.status(500).json({ error: "Analyze initial failed" });
  }
});

/* =============================
   ANALISIS FINAL
============================= */
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target_pasar } = req.body;

    const prompt = `
Anda adalah konsultan bisnis senior.

Gunakan DATA NYATA berikut (JANGAN digeneralisasi):

Ringkasan Ide:
"${ringkasan}"

Masalah:
"${masalah}"

Target Pasar:
"${target_pasar}"

Buat ANALISIS KELAYAKAN BISNIS yang TAJAM dan OPERASIONAL
dengan format WAJIB berikut:

Kesimpulan Kelayakan:
Apakah ide ini layak dijalankan dalam 6–12 bulan ke depan? Jelaskan alasannya.

Risiko Utama:
Sebutkan 2–3 risiko paling nyata dari ide ini.

Rekomendasi Aksi Nyata:
Berikan langkah konkret yang bisa dilakukan dalam 30 hari pertama
(bukan saran umum).

Gunakan bahasa tegas, kontekstual, dan praktis.
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
        temperature: 0.4
      })
    });

    const aiData = await aiRes.json();
    const final_analysis = aiData.choices?.[0]?.message?.content || "";

    res.json({ final_analysis });

  } catch (err) {
    console.error("FINAL ERROR:", err);
    res.status(500).json({ error: "Analyze final failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
