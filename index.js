import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Validasi Ide Backend OK");
});

/**
 * ANALISIS AWAL
 */
app.post("/api/analyze-initial", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || typeof idea !== "string") {
      return res.status(400).json({ error: "Idea tidak valid" });
    }

    // ⬇️ SIMULASI OUTPUT AI (anti kosong)
    const result = {
      ringkasan: `Ringkasan awal dari ide bisnis: ${idea}`,
      masalah: "Masalah utama yang ingin diselesaikan dari ide ini.",
      target_pasar: "Target pasar utama yang paling relevan."
    };

    res.json(result);
  } catch (err) {
    console.error("INITIAL ERROR:", err);
    res.status(500).json({ error: "Analyze initial failed" });
  }
});

/**
 * ANALISIS FINAL
 */
app.post("/api/analyze-final", async (req, res) => {
  try {
    const { ringkasan, masalah, target_pasar } = req.body;

    if (!ringkasan || !masalah || !target_pasar) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const final_analysis = `
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
