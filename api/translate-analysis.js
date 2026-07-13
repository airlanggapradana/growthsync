import { getGeminiClient, sendError } from "../lib/gemini.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(455).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const ai = getGeminiClient();
    const prompt = `Translate the following markdown text into ${targetLang === 'en' ? 'English' : 'Indonesian'}. Preserve all markdown formatting, emojis, and styling. Output ONLY the translated text without any wrapping code blocks.
      
Text to translate:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.status(200).json({ translatedText: response.text });
  } catch (error) {
    sendError(res, error, 'Failed to translate');
  }
}
