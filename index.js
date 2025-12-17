import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/* =========================
   PROMPT DEFINITIONS
========================= */

function promptInitial(idea) {
  return `
Anda adalah analis bisnis UMKM yang sangat praktis.

TUGAS:
Ubah ide bisnis berikut menjadi 3 komponen WAJIB:
1. Ringkasan Ide (spesifik, 3–5 kalimat)
2. Masalah Nyata yang Diselesaikan (jelas, konkret)
3. Target Pasar Spesifik (siapa, konteks, perilaku)

IDE BISNIS:
"${idea}"

ATURAN:
- Jangan normatif
- Jangan abstrak
- Jangan mengulang kata "ide bisnis ini"
- Fokus pada konteks nyata Indonesia

FORMAT OUTPUT (WAJIB JSON VALID):
{
  "ringkasan": "...",
  "masalah": "...",
  "target_pasar": "..."
}
`;
}

function promptFinal({ ringkasan, masalah, target_pasar }) {
  return `
Anda adalah konsultan Venture Capital tahap awal (Seed – Series A).

Lakukan ANALISIS FINAL terhadap bisnis berikut.

DATA BISNIS:
Ringkasan:
${ringkasan}

Masalah:
${masalah}

Target Pasar:
${target_pasar}

TUGAS ANALISIS:
1. Penilaian Kelayakan Bisnis (nyata / tidak)
2. Competitive Comparative Analysis
   - Bandingkan dengan MINIMAL 2 model bisnis serupa
3. Risiko Utama (operasional, pasar, finansial)
4. Potensi Monetisasi (bagaimana uang benar-benar masuk)
5. Skor VC Style (0–100) berdasarkan:
   - Market
   - Problem Severity
   - Differentiation
   - Execution Feasibility

ATURAN KERAS:
- Jangan normatif
- Jangan generik
- Jangan motivasional
- Bahasa lugas, profesional
- Anggap founder akan pakai ini untuk pitch deck

FORMAT OUTPUT (WAJIB JSON VALID):
{
  "final_analysis": {
    "kelayakan": "...",
    "comparative_analysis": "...",
    "risiko": "...",
    "monetisasi": "...",
    "vc_score": {
      "total": 0,
      "market": 0,
      "problem": 0,
      "differentiation": 0,
      "execution": 0
    },
    "kesimpulan": "..."
  }
}
`;
}

/* =========================
   HELPER: CALL OPENAI
========================= */

async function callOpenAI(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await res.json();

  if (!data.choices?.[0]?.message?.content) {
    throw new Error("Empty AI response");
  }

  return data.choices[0].message.content;
}

/* =========================
   ANALYZE INITIAL
========================= */

app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea required" });

    const raw = await callOpenAI(promptInitial(idea));

    const parsed = JSON.parse(raw);

    if (!parsed.ringkasan || !parsed.masalah || !parsed.target_pasar) {
      throw new Error("Incomplete initial analysis");
    }

    res.json(parsed);

  } catch (err) {
    console.error("INITIAL ERROR:", err.message);
    res.status(500).json({ error: "Analyze initial failed" });
  }
});

/* =========================
   ANALYZE FINAL
========================= */

app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target_pasar } = req.body;

    if (!ringkasan || !masalah || !target_pasar) {
      return res.status(400).json({ error: "Incomplete data" });
    }

    const raw = await callOpenAI(
      promptFinal({ ringkasan, masalah, target_pasar })
    );

    const parsed = JSON.parse(raw);

    if (!parsed.final_analysis) {
      throw new Error("Final analysis missing");
    }

    res.json(parsed.final_analysis);

  } catch (err) {
    console.error("FINAL ERROR:", err.message);
    res.status(500).json({ error: "Analyze final failed" });
  }
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
