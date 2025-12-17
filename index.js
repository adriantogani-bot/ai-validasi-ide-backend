import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ===============================
   PROMPT SYSTEM (GLOBAL)
================================ */
const SYSTEM_PROMPT = `
You are a senior venture capital analyst with 15+ years experience.
You analyze early-stage business ideas realistically.
You avoid motivational language.
You base analysis strictly on provided input.
You speak clearly, directly, and analytically.
`;

/* ===============================
   ANALISIS AWAL PROMPT
================================ */
function promptInitial({ idea, location, target, price }) {
  return `
Analyze the following early-stage business idea.

Business Idea:
${idea}

Target Location:
${location}

Target Customer:
${target}

Price Range:
${price}

Your task:
1. Rewrite the idea into a clear and concise Business Summary.
2. Identify the CORE problem this business claims to solve.
3. Define the REALISTIC target market segment.

Rules:
- Base everything ONLY on the input above.
- Do not generalize.
- No advice yet.
- Output in clear bullet points.

Output format:

Business Summary:
- ...

Problem Being Solved:
- ...

Target Market:
- ...
`;
}

/* ===============================
   ANALISIS FINAL (VC STYLE)
================================ */
function promptFinal({ approvedSummary, approvedProblem, approvedTarget }) {
  return `
Using ONLY the approved inputs below, perform a venture-capital–style evaluation.

Approved Business Summary:
${approvedSummary}

Approved Problem:
${approvedProblem}

Approved Target Market:
${approvedTarget}

Tasks:

1. Market Attractiveness Analysis
- Market size logic (qualitative)
- Demand realism
- Market urgency

2. Competitive Comparative Analysis
- Closest comparable business types
- Key differentiation gaps
- Likelihood of direct competition

3. Execution Risk Assessment
- Operational risk
- Go-to-market risk
- Cost & pricing risk

4. VC-Style Scoring (0–10)
- Market
- Differentiation
- Feasibility
- Risk profile

5. Strategic Recommendation
- Proceed / Proceed with constraints / Do not proceed
- Clear reasoning (not motivational)

Rules:
- No generic startup advice
- No buzzwords
- No assumptions beyond input
- Be critical and honest

Output clearly with headings.
`;
}

/* ===============================
   ROUTES
================================ */

app.post("/api/analyze-initial", async (req, res) => {
  try {
    const prompt = promptInitial(req.body);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    res.json({
      success: true,
      result: response.choices[0].message.content,
    });
  } catch (err) {
    console.error("INITIAL ERROR:", err);
    res.status(500).json({ success: false, message: "Initial analysis failed" });
  }
});

app.post("/api/analyze-final", async (req, res) => {
  try {
    const prompt = promptFinal(req.body);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.25,
    });

    res.json({
      success: true,
      result: response.choices[0].message.content,
    });
  } catch (err) {
    console.error("FINAL ERROR:", err);
    res.status(500).json({ success: false, message: "Final analysis failed" });
  }
});

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
