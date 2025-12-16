import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔴 ROUTE TEST (WAJIB ADA)
app.get("/", (req, res) => {
  res.send("Backend OK");
});

// 🔴 ROUTE ANALYZE (INI YANG DIPANGGIL)
app.post("/analyze", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({ error: "Idea is required" });
    }

    // MOCK dulu (jangan OpenAI dulu)
    res.json({
      status: "Layak dengan Catatan",
      score: 72,
      summary: `Analisis untuk ide: ${idea}`,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
