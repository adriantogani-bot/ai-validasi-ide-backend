import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({ status: "Backend OK" });
});

/* =========================
   ANALYSIS INITIAL
========================= */
app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({ error: "Idea is required" });
    }

    // ⬇️ SIMULASI HASIL AI (AMAN & STABIL)
    res.json({
      ringkasan: `Ringkasan awal dari ide bisnis: ${idea}`,
      masalah: "Masalah utama yang ingin diselesaikan dari ide ini.",
      target_pasar: "Target pasar utama yang paling relevan."
    });

  } catch (err) {
    console.error("INITIAL ERROR:", err);
    res.status(500).json({ error: "Analyze initial failed" });
  }
});

/* =========================
   ANALYSIS FINAL
========================= */
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target_pasar } = req.body;

    if (!ringkasan || !masalah || !target_pasar) {
      return res.status(400).json({ error: "Incomplete approval data" });
    }

    const finalAnalysis = `
ANALISIS FINAL KELAYAKAN BISNIS

1. Ringkasan:
${ringkasan}

2. Masalah:
${masalah}

3. Target Pasar:
${target_pasar}

KESIMPULAN:
Ide bisnis ini layak diuji melalui MVP skala kecil sebelum ekspansi lebih lanjut.
`;

    // ⬅️ PENTING: field harus sama dengan frontend
    res.json({
      final_analysis: finalAnalysis
    });

  } catch (err) {
    console.error("FINAL ERROR:", err);
    res.status(500).json({ error: "Analyze final failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
