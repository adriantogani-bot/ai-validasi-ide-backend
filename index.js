import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

/* ===== HEALTH CHECK ===== */
app.get("/", (req, res) => {
  res.json({ status: "Backend OK" });
});

/* ===== ANALISIS AWAL ===== */
app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea kosong" });

    const prompt = `
Buat analisis awal ide bisnis UMKM dengan 3 bagian:
1. Ringkasan Ide
2. Masalah yang Diselesaikan
3. Target Pasar
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: idea },
        ],
      }),
    });

    const data = await aiRes.json();
    res.json({ result: data.choices[0].message.content });
  } catch (err) {
    console.error("ERROR INITIAL:", err);
    res.status(500).json({ error: "AI error" });
  }
});

/* ===== ANALISIS FINAL (SETELAH APPROVAL) ===== */
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target } = req.body;

    const prompt = `
Berdasarkan persetujuan user berikut:
Ringkasan: ${ringkasan}
Masalah: ${masalah}
Target: ${target}

Berikan:
- Analisis kelayakan
- Risiko
- Rekomendasi aksi konkret
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await aiRes.json();
    res.json({ result: data.choices[0].message.content });
  } catch (err) {
    console.error("ERROR FINAL:", err);
    res.status(500).json({ error: "AI error" });
  }
});

/* ===== START ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on", PORT));
