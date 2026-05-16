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
1. Jika kesimpulan hasil menunjukkan Perkembangan Anak Meragukan (skor < 9) maka sarankan intervensi stimulasi anak sebagai berikut: Stimulasi Fisik & Motorik: Kontrol kepala dengan menggendong bayi dalam posisi tegak, Latih duduk bertahap (dengan sandaran, lalu tanpa sandaran), Latih berdiri dengan pegangi ketiak bayi dan latih kakinya menapak/menyangga berat badan, Latih tangan menggenggam kuat, memegang benda dengan kedua tangan, meraih mainan, dan menjumput benda kecil (seperti biskuit). Stimulasi Interaksi & Komunikasi: Latih bayi menengok ke arah sumber suara, Latih bicara dengan merespons dan tirukan ocehan bayi (misal: "ma-ma", "pa-pa"), Ajak main cilukba dan melihat pantulan diri di cermin. Stimulasi Emosi & Perawatan: Beri rasa aman lewat tatapan mata, senyuman, pelukan, dan ciuman, Biasakan jadwal tidur dan makan yang teratur, Perhatikan hal yang disukai dan tidak disukai bayi untuk memahami kebutuhannya.
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
