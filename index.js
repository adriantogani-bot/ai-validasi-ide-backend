import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend OK");
});

app.post("/validate-idea", (req, res) => {
  try {
    const { idea } = req.body;
    console.log("Sending idea:", idea);

    res.json({
      result: `Ide "${idea}" diterima`
    });
  } catch (err) {
    console.error("ERROR validate-idea:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
