import { getGeminiClient, sendError } from "../lib/gemini.js";
import { INTERVENSI_KNOWLEDGE } from "../lib/knowledge.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(455).json({ error: 'Method Not Allowed' });
  }

  try {
    const { ageCategory, totalScore, qna } = req.body;
    if (!ageCategory || totalScore === undefined || !qna) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const ai = getGeminiClient();
    const prompt = `Anda adalah asisten AI ahli tumbuh kembang anak.
Berdasarkan data kuesioner berikut, berikan analisis yang mendukung dan suportif kepada orang tua dengan format Markdown.
Gunakan pengetahuan berikut secara mutlak sebagai pedoman atau rujukan intervensi berdasarkan usia anak:

${INTERVENSI_KNOWLEDGE}

Data anak: Usia ${ageCategory.replace('_', ' ')}
Total Skor: ${totalScore} (Sesuai jika >= 9, Meragukan jika 7-8, Penyimpangan jika < 7)

Kuesioner yang dijawab:
${qna.map((item) => `- Kategori ${item.kategori}: ${item.pertanyaan} -> Jawaban: ${item.jawaban}`).join('\n')}

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
    res.status(200).json({ analysisId: parsedResponse.id, analysisEn: parsedResponse.en });
  } catch (error) {
    sendError(res, error, 'Failed to generate analysis');
  }
}
