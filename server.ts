import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/analyze-questionnaire", async (req, res) => {
    try {
      const { ageCategory, totalScore, qna } = req.body;
      
      const prompt = `Anda adalah asisten AI ahli tumbuh kembang anak.
Berdasarkan data kuesioner berikut, berikan analisis yang mendukung dan suportif kepada orang tua dengan format Markdown.
Gunakan pengetahuan berikut secara mutlak:
1. Jika kesimpulan hasil menunjukkan Perkembangan Anak Meragukan (skor < 9) maka sarankan intervensi stimulasi anak sebagai berikut:
- Stimulasi Motorik Kasar: Merangkak menuju mainan, Berdiri dengan bantuan/tarikan tangan, Berjalan sambil berpegangan.
- Stimulasi Motorik Halus: Memegang mainan dengan kedua tangan, Memegang alat tulis dan mencoret-coret, Memasukkan dan mengeluarkan benda dari wadah.
- Stimulasi Bahasa: Mengajak bicara dan memanggil nama bayi, Membacakan buku cerita bergambar, Mengajarkan kata-kata sederhana dari suara bayi.
- Stimulasi Sosial dan Emosional: Memberikan pelukan dan senyuman, Mengenalkan suasana hati bayi, Bermain sosial sederhana (misalnya tepuk tangan).
- Stimulasi Kognitif: Mengajarkan konsep sebab-akibat, Melatih mencari dan menemukan mainan, Melatih membuat bunyi-bunyian dari benda/mainan.
2. Jika kesimpulan hasil menunjukkan Perkembangan Anak Sesuai (skor >= 9) maka sarankan dan ingatkan orang tua melakukan pengecekan tumbuh kembang anak di bulan selanjutnya.

Data anak: Usia ${ageCategory === '3_bulan' ? '3 Bulan' : '6 Bulan'}
Total Skor: ${totalScore} (Sesuai jika >= 9, Meragukan jika 7-8, Penyimpangan jika < 7)

Kuesioner yang dijawab:
${qna.map((item: any) => `- Kategori ${item.kategori}: ${item.pertanyaan} -> Jawaban: ${item.jawaban}`).join('\n')}

Berikan simpulan singkat yang menenangkan orang tua, dilanjutkan dengan poin-poin saran sesuai petunjuk di atas. Usahakan ringkas namun aplikatif.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ analysis: response.text });
    } catch (error) {
      console.error('Error generating analysis:', error);
      res.status(500).json({ error: 'Failed to generate analysis' });
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
    } catch (error) {
      console.error('Error finding puskesmas:', error);
      res.status(500).json({ error: 'Failed to find puskesmas' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
