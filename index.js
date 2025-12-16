import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// =======================
// HEALTH CHECK
// =======================
app.get("/", (req, res) => {
  res.send("Backend AI Validasi Ide Aktif");
});

// =======================
// ANALYZE ENDPOINT (FINAL)
// =======================
app.post("/api/analyze", async (req, res) => {
  try {
    const { idea, approvedSummary, approvedProblems, approvedTarget } = req.body;

    if (!idea) {
      return res.status(400).json({ error: "Idea is required" });
    }

    // =======================
    // PROMPT BERJENJANG + CTA
    // =======================
    const prompt = `
Anda adalah konsultan bisnis UMKM Indonesia yang sangat kritis dan praktis.

Gunakan informasi berikut:

IDE AWAL:
${idea}

${approvedSummary ? `RINGKASAN IDE DISETUJUI USER:\n${approvedSummary}` : ""}
${approvedProblems ? `MASALAH YANG DISETUJUI USER:\n${approvedProblems}` : ""}
${approvedTarget ? `TARGET PASAR DISETUJUI USER:\n${approvedTarget}` : ""}

Tugas Anda:

1. Ringkasan Ide (jelas, 3–4 kalimat)
2. Masalah Utama yang Diselesaikan (bullet points)
3. Target Pasar Spesifik (siapa, daya beli, perilaku)
4. Keunggulan & Diferensiasi
5. Risiko & Tantangan Nyata
6. Validasi Cepat (MVP 14–30 hari)
7. Rekomendasi Aksi Nyata (Call To Action):
   - Langkah 7 hari
   - Langkah 30 hari
   - Indikator lanjut / berhenti

Gunakan bahasa Indonesia yang lugas, bukan teori.
`;

    // =======================
    // CALL OPENAI API
    // =======================
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Anda adalah analis bisnis UMKM." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error("No response from OpenAI");
    }

    res.json({
      result: data.choices[0].message.content,
    });

  } catch (error) {
    console.error("ERROR ANALYZE:", error);
    res.status(500).json({
      error: "Gagal memproses analisis",
      detail: error.message,
    });
  }
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
