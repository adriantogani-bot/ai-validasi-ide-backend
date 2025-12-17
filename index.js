import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json({ limit: "1mb" }));

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.json({ status: "Backend OK" });
});

/* ================= ANALYZE INITIAL ================= */
app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || typeof idea !== "string") {
      return res.status(400).json({ error: "Idea tidak valid" });
    }

    // SIMULASI ANALISIS AWAL (AMAN)
    const ringkasan = `Ringkasan awal dari ide bisnis: ${idea}`;
    const masalah = "Masalah utama yang ingin diselesaikan dari ide ini.";
    const target_pasar = "Target pasar utama yang paling relevan.";

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

/* ================= ANALYZE FINAL ================= */
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target_pasar } = req.body;

    if (!ringkasan || !masalah || !target_pasar) {
      return res.status(400).json({ error: "Data approval tidak lengkap" });
    }

    const finalAnalysis = `
### Analisis Kelayakan Final

**Ringkasan Ide**
${ringkasan}

**Masalah Utama**
${masalah}

**Target Pasar**
${target_pasar}

### Rekomendasi Aksi Nyata
1. Validasi permintaan pasar dengan pre-order
2. Uji harga dan margin secara bertahap
3. Gunakan channel komunitas sebagai distribusi awal
4. Hindari investasi besar sebelum PMF tercapai
    `.trim();

    res.json({
      final_analysis: finalAnalysis
    });

  } catch (err) {
    console.error("FINAL ERROR:", err);
    res.status(500).json({ error: "Analyze final failed" });
  }
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
