import express from "express";
import cors from "cors";

const app = express();

/* =========================
   MIDDLEWARE WAJIB
========================= */
app.use(cors());
app.use(express.json({ limit: "1mb" }));

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

/* =========================
   ANALYZE INITIAL
========================= */
app.post("/api/analyze-initial", async (req, res) => {
  try {
    console.log("=== ANALYZE INITIAL ===");
    console.log("BODY:", req.body);

    const { idea } = req.body || {};

    if (!idea || idea.trim() === "") {
      return res.status(400).json({ error: "Idea is required" });
    }

    // SIMULASI AI (AMAN)
    const result = {
      ringkasan:
        "Ringkasan awal dari ide bisnis: " + idea,
      masalah:
        "Masalah utama yang ingin diselesaikan dari ide ini.",
      target:
        "Target pasar utama yang paling relevan."
    };

    res.json(result);
  } catch (err) {
    console.error("INITIAL ERROR:", err);
    res.status(500).json({ error: "Analyze initial failed" });
  }
});

/* =========================
   ANALYZE FINAL (SETUJU)
========================= */
app.post("/api/analyze-final", async (req, res) => {
  try {
    console.log("=== ANALYZE FINAL ===");
    console.log("BODY:", req.body);

    const {
      ringkasan,
      masalah,
      target
    } = req.body || {};

    if (!ringkasan || !masalah || !target) {
      return res.status(400).json({
        error: "Approved data incomplete"
      });
    }

    // SIMULASI ANALISIS FINAL
    const finalResult = {
      analisis:
        "Analisis kelayakan mendalam berdasarkan persetujuan user.",
      risiko:
        "Risiko utama dan tantangan bisnis.",
      rekomendasi:
        [
          "Uji pasar skala kecil",
          "Validasi harga",
          "Bangun diferensiasi",
          "Hitung ulang margin"
        ]
    };

    res.json(finalResult);
  } catch (err) {
    console.error("FINAL ERROR:", err);
    res.status(500).json({ error: "Analyze final failed" });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
