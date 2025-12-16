import express from "express";
import cors from "cors";

const app = express();

/* ===== middleware WAJIB ===== */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

/* ===== health check ===== */
app.get("/", (req, res) => {
  res.send("Backend AI Validasi Ide: OK");
});

/* ===== endpoint utama ===== */
app.post("/api/analyze", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) {
      return res.status(400).json({ error: "Idea is required" });
    }

    // sementara dummy response (UNTUK TEST STABIL)
    res.json({
      result: `Analisis berhasil untuk ide: ${idea}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ===== PORT ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
