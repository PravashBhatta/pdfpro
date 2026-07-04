import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { generateContentWithRetry } from "@/src/lib/gemini";


export async function POST(req: NextRequest) {
  try {
    const { prompt, model, customApiKey, context, mode, questionCount } = await req.json();

    // Cap input context to lower token request (60,000 chars is ~15,000 tokens)
    const cappedContext = (context || "").substring(0, 60000);  //preprocessor

    // Extract custom keys if configured as JSON
    let geminiKey = "";
    let openrouterKey = "";
    let xaiKey = "";
    if (customApiKey) {
      try {
        const keys = JSON.parse(customApiKey);
        geminiKey = keys.gemini || "";
        openrouterKey = keys.openrouter || "";
        xaiKey = keys.xai || "";
      } catch (e) {
        geminiKey = customApiKey;
      }
    }

    const modelToRoute = model || "gemini-3.5-flash";

    // 2. ROUTE TO OPENROUTER DIRECTLY (GEMMA/VEO/GPT-OSS/NEMOTRON/FALLBACK)
    if (modelToRoute.startsWith('openrouter-')) {
      const apiKeyToUse = openrouterKey || process.env.OPENROUTER_API_KEY;
      if (!apiKeyToUse) {
        return NextResponse.json({
          error: "OpenRouter Developer API Key is missing. Please configure your key in settings."
        }, { status: 400 });
      }

      let openrouterModel: string | string[];
      switch (modelToRoute) {
        case 'openrouter-gemma-4':
          openrouterModel = 'google/gemma-4-26b-a4b-it';
          break;
        case 'openrouter-gpt-oss-120b':
          openrouterModel = 'openai/gpt-oss-120b';
          break;
        case 'openrouter-nemotron-3':
          openrouterModel = 'nvidia/nemotron-3-ultra-550b-a55b';
          break;
        default:
          openrouterModel = 'google/gemma-4-26b-a4b-it';
      }

      const systemInstruction = mode === "mcq"
        ? "You are an expert assessment generator for document study aids. Use only the provided context to create high-quality multiple-choice questions. If the context is thin, reduce the scope instead of inventing unsupported facts. Return only clean markdown with no preamble."
        : "You are a strict PDF research intelligence system. Rely only on the context provided where possible. If not found, indicate gracefully but answer constructively.";

      const resolvedPrompt = prompt || (mode === "mcq" ? "Generate multiple-choice questions from the provided context." : "Analyze the provided context.");
      const userMessage = cappedContext ? `Context:\n${cappedContext}\n\nUser request: ${resolvedPrompt}` : resolvedPrompt;

      const payload: any = {
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 1024
      };

      if (Array.isArray(openrouterModel)) {
        payload.models = openrouterModel;
      } else {
        payload.model = openrouterModel;
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKeyToUse}`,
          "HTTP-Referer": "https://ai.studio/build",
          "X-Title": "Pdfpro AI Builder Workspace"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.status !== 200 || data.error) {
        return NextResponse.json(
          { error: data.error?.message || `OpenRouter API call failed with status ${response.status}: ${JSON.stringify(data)}` },
          { status: response.status }
        );
      }

      const reply = data.choices?.[0]?.message?.content || "No response received from OpenRouter.";
      return NextResponse.json({ text: reply });
    }

    // 3. FALLBACK: STANDARD SECURE GEMINI INTEGRATION
    const apiKey = geminiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: "Missing API Key. Please provide your Gemini API key in settings or configure GEMINI_API_KEY on the server."
      }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const generationMode = mode === "mcq" ? "mcq" : "chat";
    const resolvedPrompt = prompt || (generationMode === "mcq" ? "Generate multiple-choice questions from the provided context." : "Analyze the provided context.");

    const fullPrompt = generationMode === "mcq"
      ? `System instruction: You are an expert assessment generator for document study aids. Use only the provided context to create high-quality multiple-choice questions. If the context is thin, reduce the scope instead of inventing unsupported facts. Return only clean markdown with no preamble.\n\nContext:\n${cappedContext || "No context was provided."}\n\nTask: Create ${questionCount || 5} multiple-choice questions. Each question must have 4 answer choices labeled A, B, C, and D. Put the correct answer and a one-sentence explanation directly below each question. End with a concise answer key.\n\nUser request: ${resolvedPrompt}`
      : cappedContext 
        ? `System instruction: You are a strict PDF research intelligence system. Rely only on the context provided where possible. If not found, indicate gracefully but answer constructively.\n\nContext:\n${cappedContext}\n\nUser request: ${resolvedPrompt}`
        : resolvedPrompt;

    const geminiModel = (modelToRoute === 'gemini-3.5-pro' || modelToRoute === 'gemini-3.1-pro')
      ? 'gemini-2.5-pro'
      : 'gemini-2.5-flash';

    const response = await generateContentWithRetry(ai, {
      model: geminiModel,
      contents: fullPrompt,
      config: {
        maxOutputTokens: generationMode === "mcq" ? 4096 : 1024
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (err: any) {
    console.error("Route generation failed:", err);
    return NextResponse.json({ error: err.message || "Failed to generate AI response" }, { status: 500 });
  }
}
