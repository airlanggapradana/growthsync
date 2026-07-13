import { GoogleGenAI } from "@google/genai";

let aiInstance = null;

export function getGeminiClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

export function sendError(res, error, message = "Internal Server Error", status = 500) {
  console.error(message, error);
  res.status(status).json({
    error: message,
    details: error instanceof Error ? error.message : String(error)
  });
}
