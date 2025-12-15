import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

// 🔎 Debug aman (INI BOLEH)
console.log(
  "OPENAI KEY exists:",
  !!process.env.OPENAI_API_KEY
);

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check
app.get("/", (req, res) => {
  res.send("Backend OK");
});

// API utama
app.post("/validate-idea", async (req, res) => {
  try {
    const { idea } = req.body;

    console.log("Sending idea:", idea);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Kamu adalah konsultan bisnis.",
        },
        {
          role: "user",
          content: `Validasi ide bisnis ini: ${idea}`,
        },
      ],
    });

    res.json({
      result: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error("OPENAI ERROR:", err.message);
    res.status(500).json({
      error: "Gagal memproses ide",
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
