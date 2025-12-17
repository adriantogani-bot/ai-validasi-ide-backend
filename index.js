import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("Backend AI Validasi Ide UMKM OK");
});

/* ===============================
   ANALYZE INITIAL
================================ */
app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || typeof idea !== "string") {
      return res.status(400).json({ error: "Idea is required" });
    }

    // ⛔️ JANGAN JSON.parse response AI
    // Anggap AI mengembalikan TEKS BIASA

    const ringkasan = `Ringkasan awal dari ide bisnis: ${idea}`;
    const masalah = `Masalah utama yang ingin diselesaikan dari ide ini.`;
    const target_pasar = `Target pasar utama yang paling relevan.`;

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

/* ===============================
   ANALYZE FINAL
================================ */
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target_pasar } = req.body;

    if (!ringkasan || !masalah || !target_pasar) {
      return res.status(400).json({ error: "Data approval tidak lengkap" });
    }

    // ⛔️ JANGAN PARSE JSON DARI AI
    const finalAnalysis = `
KESIMPULAN KELAYAKAN BISNIS

Ringkasan:
${ringkasan}

Masalah:
${masalah}

Target Pasar:
${target_pasar}

REKOMENDASI AKSI:
1. Uji pasar dengan skala kecil
2. Validasi minat dengan pre-order
3. Hitung ulang struktur biaya
4. Fokus diferensiasi utama
`;

    // ✅ WAJIB OBJECT JSON
    res.json({
      final_analysis: finalAnalysis.trim()
    });

  } catch (err) {
    console.error("FINAL ERROR:", err);
    res.status(500).json({ error: "Analyze final failed" });
  }
});

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
