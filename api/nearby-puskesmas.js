import { getGeminiClient, sendError } from "../lib/gemini.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(455).json({ error: 'Method Not Allowed' });
  }

  try {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Missing required parameters: lat, lng' });
    }

    const ai = getGeminiClient();
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

    res.status(200).json({ result: parsedResult });
  } catch (error) {
    console.error('Error finding puskesmas:', error);
    res.status(500).json({ 
      error: 'Gagal menghubungi Gemini AI untuk mencari puskesmas. Pastikan API key valid atau coba lagi nanti.',
      details: error?.message || 'Unknown error'
    });
  }
}
