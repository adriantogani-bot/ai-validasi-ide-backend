import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/* health check */
app.get("/", (req, res) => {
  res.send("Backend alive");
});

/* ANALYZE */
app.post("/api/analyze", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.length < 10) {
      return res.status(400).json({ error: "Ide tidak valid" });
    }

    const prompt = `
Anda adalah konsultan bisnis UMKM Indonesia.

Analisis ide berikut secara singkat dan praktis:

"${idea}"

Berikan:
1. Ringkasan ide
2. Target pasar
3. Risiko utama
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const aiData = await aiRes.json();

    res.json({
      result: aiData.choices?.[0]?.message?.content || "No output"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analyze failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on", PORT);
});
