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
 * HEALTH CHECK
 */
app.get("/", (req, res) => {
  res.send("AI Validasi Ide Backend OK");
});

/**
 * MAIN ANALYSIS ENDPOINT
 */
app.post("/analyze", async (req, res) => {
  try {
    const { step } = req.body;

    if (!step) {
      return res.status(400).json({ error: "step is required" });
    }

    /**
     * =========================
     * STEP 1 — DRAFT AWAL
     * =========================
     */
    if (step === "draft") {
      const { idea } = req.body;

      if (!idea) {
        return res.status(400).json({ error: "idea is required" });
      }

      const draftPrompt = `
Anda adalah analis bisnis UMKM Indonesia.

Tugas Anda:
Buatkan DRAFT AWAL dari ide bisnis berikut, TANPA analisis mendalam.

Ide bisnis:
"${idea}"

Hasilkan dalam format JSON dengan struktur:
{
  "summary": "Ringkasan ide bisnis dalam 2–3 kalimat",
  "problem": "Masalah utama yang diselesaikan ide ini",
  "targetMarket": "Target pasar utama yang paling relevan"
}

Gunakan bahasa Indonesia yang lugas dan mudah dipahami.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: draftPrompt }],
        temperature: 0.4,
      });

      const content = completion.choices[0].message.content;

      return res.json({
        step: "draft",
        draft: JSON.parse(content),
      });
    }

    /**
     * =========================
     * STEP 2 — ANALISIS FINAL
     * =========================
     */
    if (step === "final") {
      const { approved } = req.body;

      if (
        !approved ||
        !approved.summary ||
        !approved.problem ||
        !approved.targetMarket
      ) {
        return res.status(400).json({
          error: "approved.summary, approved.problem, approved.targetMarket are required",
        });
      }

      const finalPrompt = `
Anda adalah analis bisnis UMKM Indonesia berpengalaman.

Gunakan data yang SUDAH DISETUJUI user berikut:

Ringkasan Ide:
"${approved.summary}"

Masalah yang Diselesaikan:
"${approved.problem}"

Target Pasar:
"${approved.targetMarket}"

Lakukan ANALISIS BISNIS MENDALAM dan hasilkan output dengan struktur:

1. Status Kelayakan Ide (Layak / Layak dengan Catatan / Kurang Layak)
2. Skor Potensi Pasar (0–100)
3. Analisis Pasar
4. Analisis Persaingan
5. Risiko Utama
6. Rekomendasi Strategis
7. Call To Action (langkah konkret 7 hari ke depan)

Gunakan bahasa Indonesia yang tegas, jujur, dan praktis.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: finalPrompt }],
        temperature: 0.6,
      });

      return res.json({
        step: "final",
        analysis: completion.choices[0].message.content,
      });
    }

    return res.status(400).json({ error: "Invalid step value" });

  } catch (error) {
    console.error("ANALYZE ERROR:", error);
    res.status(500).json({ error: "Failed to analyze idea" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
