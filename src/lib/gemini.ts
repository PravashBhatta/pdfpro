import { GoogleGenAI } from "@google/genai";

export async function generateContentWithRetry(
  ai: GoogleGenAI,
  options: {
    model: string;
    contents: any;
    config?: any;
  },
  maxRetries = 4,
  initialDelay = 1500
) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(options);
    } catch (error: any) {
      const errorMsg = error.message || "";
      const is503 = errorMsg.includes("503") || 
                    errorMsg.includes("UNAVAILABLE") || 
                    errorMsg.includes("high demand") ||
                    error.status === 503;
      
      console.warn(`[Gemini API] Attempt ${attempt} failed: ${errorMsg}`);
      
      if (is503 && attempt < maxRetries) {
        console.warn(`[Gemini API] Transient 503/UNAVAILABLE error. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to generate content after retries");
}
