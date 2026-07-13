import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INTERVENSI_KNOWLEDGE } from "./src/data/knowledge.ts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes FIRST
app.post("/api/analyze-questionnaire", async (req, res) => {
  try {
    const { ageCategory, totalScore, qna } = req.body;
    
    const prompt = `Anda adalah asisten AI ahli tumbuh kembang anak.
Berdasarkan data kuesioner berikut, berikan analisis yang mendukung dan suportif kepada orang tua dengan format Markdown.
Gunakan pengetahuan berikut secara mutlak sebagai pedoman atau rujukan intervensi berdasarkan usia anak:

${INTERVENSI_KNOWLEDGE}

Data anak: Usia ${ageCategory.replace('_', ' ')}
Total Skor: ${totalScore} (Sesuai jika >= 9, Meragukan jika 7-8, Penyimpangan jika < 7)

Kuesioner yang dijawab:
${qna.map((item: any) => `- Kategori ${item.kategori}: ${item.pertanyaan} -> Jawaban: ${item.jawaban}`).join('\n')}

Berikan simpulan singkat yang menenangkan orang tua, dilanjutkan dengan poin-poin saran intervensi sesuai dokumen rujukan di atas. Usahakan ringkas namun aplikatif.

Berikan respons akhir Anda dalam format JSON (bukan markdown block) dengan properti "id" (terjemahan bahasa Indonesia) dan "en" (terjemahan bahasa Inggris dari respons "id"). Struktur:
{ "id": "Markdown text Indonesia", "en": "Markdown text English" }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedResponse = JSON.parse(response.text || '{}');
    res.json({ analysisId: parsedResponse.id, analysisEn: parsedResponse.en });
  } catch (error) {
    console.error('Error generating analysis:', error);
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
});

app.post("/api/translate-analysis", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    
    const prompt = `Translate the following markdown text into ${targetLang === 'en' ? 'English' : 'Indonesian'}. Preserve all markdown formatting, emojis, and styling. Output ONLY the translated text without any wrapping code blocks.
    
Text to translate:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ translatedText: response.text });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Failed to translate' });
  }
});

app.post("/api/nearby-puskesmas", async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    const prompt = `Carikan daftar puskesmas terdekat dari koordinat lokasi ini: Latitude ${lat}, Longitude ${lng}. 
Berikan rekomendasi 3-5 puskesmas beserta detail estimasi jarak, alamat lengkap, nomor telepon, dan koordinat marker (latitude, longitude).
Keluarkan struktur data murni dalam format JSON object dengan satu key "puskesmas" yang berisi array of objects. Setiap object harus memiliki tipe data dan key berikut persis:
{
  "puskesmas": [
    {
      "name": "Nama Puskesmas",
      "address": "Alamat Lengkap",
      "distance": "Jarak (misal 2.5 km)",
      "phone": "Nomor Telepon",
      "lat": -6.213,
      "lng": 106.845
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let parsedResult;
    try {
      const text = response.text || "{}";
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      parsedResult = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON parse error:", response.text);
      parsedResult = { puskesmas: [] };
    }

    res.json({ result: parsedResult });
  } catch (error: any) {
    console.error('Error finding puskesmas:', error);
    res.status(500).json({ 
      error: 'Gagal menghubungi Gemini AI untuk mencari puskesmas. Pastikan API key valid atau coba lagi nanti.',
      details: error?.message || 'Unknown error'
    });
  }
});

app.get("/api/wilayah/provinces", async (req, res) => {
  try {
    const response = await fetch("https://wilayah.id/api/provinces.json");
    if (!response.ok) throw new Error("Failed to fetch provinces");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch provinces" });
  }
});

app.get("/api/wilayah/regencies/:provinceId", async (req, res) => {
  try {
    const response = await fetch(`https://wilayah.id/api/regencies/${req.params.provinceId}.json`);
    if (!response.ok) throw new Error("Failed to fetch regencies");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch regencies" });
  }
});

app.get("/api/wilayah/districts/:regencyId", async (req, res) => {
  try {
    const response = await fetch(`https://wilayah.id/api/districts/${req.params.regencyId}.json`);
    if (!response.ok) throw new Error("Failed to fetch districts");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

app.get("/api/wilayah/villages/:districtId", async (req, res) => {
  try {
    const response = await fetch(`https://wilayah.id/api/villages/${req.params.districtId}.json`);
    if (!response.ok) throw new Error("Failed to fetch villages");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch villages" });
  }
});

// Vite middleware for development (ONLY if not on Vercel and in dev mode)
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
  });
}

// Start local dev server if not on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
