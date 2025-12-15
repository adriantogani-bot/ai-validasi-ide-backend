import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend OK");
});

app.post("/validate-idea", (req, res) => {
  const { idea } = req.body;
  res.json({ result: `Ide "${idea}" diterima` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
