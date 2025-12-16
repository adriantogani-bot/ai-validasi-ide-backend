import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==========================
// PROMPT TEMPLATES
// ==========================

// 1️⃣ SYSTEM PROMPT (ROLE)
const SYSTEM_PROMPT = `
Anda adalah analis bisnis UMKM Indonesia dengan pengalaman lebih dari 15 tahun.
Anda berpikir kritis, realistis, dan tidak menjual mimpi.

Gunakan bahasa Indonesia yang lugas, mudah dipahami, dan praktis.
Hindari istilah akademik dan jargon konsultan.

Tujuan Anda adalah membantu user mengambil keputusan bisnis,
bukan menyenangkan atau memotivasi secara berlebihan.
`;

// 2️⃣ STEP 1 – PEMAHAMAN IDE
function promptStep1(input) {
  return `
Pahami ide bisnis berikut secara objektif.

Ide bisnis:
- Produk/Jasa: ${input.idea}
- Lokasi: ${input.location}
- Target Konsumen: ${input.target}
- Harga: ${input.price}

Tugas:
Ringkas ide bisnis ini dalam 3–4 kalimat.
Sebutkan dengan jelas:
- Produk apa
- Untuk siapa
- Masalah apa yang ingin diselesaikan
`;
}

// 3️⃣ STEP 2 – ANALISIS PASAR & PERSAINGAN
function promptStep2(summary) {
  return `
Berikut ringkasan ide bisnis:
${summary}

Analisis:
1. Kondisi permintaan pasar secara umum
2. Tingkat persaingan (rendah / sedang / tinggi)
3. Hambatan masuk untuk pemain baru

Jawab dengan poin-poin singkat.
`;
}

// 4️⃣ STEP 3 – RISIKO & KELEMAHAN
function promptStep3(summary) {
  return `
Berdasarkan ide bisnis berikut:
${summary}

Identifikasi:
- Risiko utama dalam 3 bulan pertama
- Kesalahan umum yang sering dilakukan pemula
- Faktor yang bisa menyebabkan usaha gagal

Gunakan bahasa tegas dan jujur.
`;
}

// 5️⃣ STEP 4 – REKOMENDASI & KEPUTUSAN
function promptStep4(summary, market, risks) {
  return `
Gunakan informasi berikut:

RINGKASAN IDE:
${summary}

ANALISIS PASAR:
${market}

RISIKO:
${risks}

Tugas akhir:
1. Tentukan status ide:
   - Layak
   - Layak dengan Catatan
   - Kurang Layak
2. Berikan skor potensi pasar (0–100)
3. Berikan 3 rekomendasi aksi paling realistis
4. Jika perlu, sarankan pivot paling logis

Jawab terstruktur dan ringkas.
`;
}

// ==========================
// API ENDPOINT
// ==========================

app.post("/validate-idea", async (req, res) => {
  try {
    const input = req.body;

    // DEBUG CEPAT
    console.log("📩 Input diterima:", input);

    // STEP 1
    const step1 = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: promptStep1(input) },
      ],
    });

    const summary = step1.choices[0].message.content;

    // STEP 2
    const step2 = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: promptStep2(summary) },
      ],
    });

    const marketAnalysis = step2.choices[0].message.content;

    // STEP 3
    const step3 = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: promptStep3(summary) },
      ],
    });

    const riskAnalysis = step3.choices[0].message.content;

    // STEP 4 (FINAL OUTPUT)
    const step4 = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: promptStep4(summary, marketAnalysis, riskAnalysis),
        },
      ],
    });

    const finalResult = step4.choices[0].message.content;

    res.json({
      summary,
      marketAnalysis,
      riskAnalysis,
      finalResult,
    });
  } catch (error) {
    console.error("❌ Failed to call OpenAI:", error);
    res.status(500).json({
      error: "Failed to analyze business idea",
    });
  }
});

// ==========================
// SERVER START
// ==========================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
