import express from "express";
import cors from "cors";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("ENV KEYS:", 
Object.keys(process.env));

const app = express();

app.use(cors());
app.use(express.json());

console.log("OPENAI KEY exists:", !!
process.env.OPENAI_API_KEY);

app.get("/", (req, res) => {
  res.send("Backend OK");
});

app.post("/validate-idea", (req, res) => {
  try {
    const { idea } = req.body;
    console.log("Sending idea:", idea);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Kamu adalah analis bisnis yang kritis dan jujur."
        },
        {
          role: "user",
          content: `Tolong validasi ide bisnis berikut secara singkat:\n${idea}`
        }
      ],
    });

    res.json({
      result: response.choices[0].message.content
    });

  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({
      error: "Gagal memproses ide dengan AI"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
