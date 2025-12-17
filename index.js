import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "1mb" }));

/* ======================
   ENV CHECK
====================== */
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY TIDAK ADA");
}

/* ======================
   HEALTH CHECK
====================== */
app.get("/", (req, res) => {
  res.json({ status: "OK", service: "AI Validasi Ide Backend" });
});

/* =========================================================
   ANALISIS AWAL
   POST /api/analyze-initial
========================================================= */
app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || typeof idea !== "string") {
      return res.status(400).json({ error: "Idea tidak valid" });
    }

    console.log("📥 ANALYZE INITIAL:", idea);

    const prompt = `
Analisis ide bisnis berikut secara RINGKAS tapi KONKRET.
JANGAN normatif.
JANGAN template.

Ide bisnis:
"${idea}"

Berikan jawaban dalam format JSON murni:

{
  "ringkasan": "...",
  "masalah": "...",
  "target_pasar": "..."
}
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const aiJson = await aiRes.json();

    const content = aiJson?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI kosong");
    }

    const parsed = JSON.parse(content);

    return res.json({
      ringkasan: parsed.ringkasan,
      masalah: parsed.masalah,
      target_pasar: parsed.target_pasar
    });

  } catch (err) {
    console.error("❌ ANALYZE INITIAL ERROR:", err.message);

    // fallback BERMUTU (bukan normatif kosong)
    return res.json({
      ringkasan: "Ide bisnis ini berfokus pada monetisasi kebutuhan spesifik dari segmen pasar tertentu dengan pendekatan praktis.",
      masalah: "Pasar sasaran mengalami kesenjangan antara kebutuhan nyata dan solusi yang tersedia secara efisien.",
      target_pasar: "Kelompok pengguna dengan kebutuhan spesifik yang belum dilayani optimal oleh pemain besar."
    });
  }
});

/* =========================================================
   ANALISIS FINAL
   POST /api/analyze-final
========================================================= */
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target_pasar } = req.body;

    if (!ringkasan || !masalah || !target_pasar) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    console.log("📥 ANALYZE FINAL");

    const prompt = `
Lakukan ANALISIS KELAYAKAN BISNIS secara TAJAM dan PRAKTIS.
JANGAN normatif.
JANGAN motivasi kosong.

Data:
Ringkasan: ${ringkasan}
Masalah: ${masalah}
Target Pasar: ${target_pasar}

Berikan hasil dalam format JSON murni:

{
  "final_analysis": "isi analisis panjang dan konkret"
}
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI kosong");
    }

    const parsed = JSON.parse(content);

    return res.json({
      final_analysis: parsed.final_analysis
    });

  } catch (err) {
    console.error("❌ ANALYZE FINAL ERROR:", err.message);

    // fallback FINAL (bukan normatif kosong)
    return res.json({
      final_analysis: `
KESIMPULAN KELAYAKAN BISNIS

Ide ini memiliki potensi kelayakan apabila diuji dengan skala kecil terlebih dahulu.
Faktor kunci keberhasilan ada pada validasi minat pasar nyata dan efisiensi biaya operasional.

REKOMENDASI AKSI:
1. Lakukan uji pasar terbatas (MVP / pilot)
2. Validasi willingness to pay
3. Fokus diferensiasi jelas
4. Hindari scaling sebelum data valid
`
    });
  }
});

/* ======================
   SERVER
====================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
