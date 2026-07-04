import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { generateContentWithRetry } from "@/src/lib/gemini";

export const dynamic = "force-dynamic";

function extractJson(text: string) {
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = text.match(jsonBlockRegex);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (innerErr) {
        throw new Error("Failed to parse inner JSON: " + (innerErr as Error).message);
      }
    }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (innerErr) {
        throw new Error("Failed to parse substring JSON: " + (innerErr as Error).message);
      }
    }
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { context, model, customApiKey } = await req.json();

    if (!context || !context.trim()) {
      return NextResponse.json({ error: "No document context was provided." }, { status: 400 });
    }

    // Cap input context to lower token request (60,000 chars is ~15,000 tokens)
    const cappedContext = context.substring(0, 60000); //preprocessor

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

    const systemPrompt = `You are a professional educational assessor. Generate exactly 5 challenging multiple-choice questions (MCQs) based strictly on the provided document context.
Each question must have exactly 4 choices.
Ensure the questions cover important facts, key assertions, or analytical insights in the text.
Provide a clear, educational explanation for why the correct option is correct.

You MUST return ONLY a valid JSON object matching this structure:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why this option is correct, referencing the context if possible"
    }
  ]
}`;

    // 2. ROUTE TO OPENROUTER DIRECTLY (GEMMA/VEO/GPT-OSS/NEMOTRON/FALLBACK)
    if (modelToRoute.startsWith('openrouter-')) {
      const apiKeyToUse = openrouterKey || process.env.OPENROUTER_API_KEY;
      if (!apiKeyToUse) {
        return NextResponse.json({ error: "OpenRouter Developer API Key is missing. Please configure your key in settings." }, { status: 400 });
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

      const payload: any = {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Context:\n${cappedContext}\n\nTask: Generate 5 multiple-choice questions based on the context above in strict JSON format.` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1500
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

      const textOutput = data.choices?.[0]?.message?.content;
      if (!textOutput) {
        throw new Error("No response output from OpenRouter.");
      }

      const quizData = extractJson(textOutput);
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error("Invalid output format returned by OpenRouter.");
      }

      return NextResponse.json({ success: true, questions: quizData.questions });
    }

    // 3. FALLBACK: STANDARD SECURE GEMINI INTEGRATION
    const apiKey = geminiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: "Missing API Key. Please configure your Gemini API key in settings or configure GEMINI_API_KEY on the server."
      }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Select correct model configuration mapping
    const mappedModel = (modelToRoute === 'gemini-3.5-pro' || modelToRoute === 'gemini-3.1-pro')
      ? 'gemini-2.5-pro'
      : 'gemini-2.5-flash';

    const response = await generateContentWithRetry(ai, {
      model: mappedModel,
      contents: `Context:\n${cappedContext}\n\nTask: Generate 5 multiple-choice questions based on the context above.`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3, // low temperature for high factual accuracy
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
        responseSchema: {
          type: "OBJECT",
          properties: {
            questions: {
              type: "ARRAY",
              description: "List of generated multiple choice questions",
              items: {
                type: "OBJECT",
                properties: {
                  question: {
                    type: "STRING",
                    description: "The question text"
                  },
                  options: {
                    type: "ARRAY",
                    description: "Exactly 4 options for the question",
                    items: {
                      type: "STRING"
                    }
                  },
                  correctIndex: {
                    type: "INTEGER",
                    description: "The 0-based index of the correct option inside the options array (0 to 3)"
                  },
                  explanation: {
                    type: "STRING",
                    description: "Detailed explanation of why this option is correct, referencing the context if possible"
                  }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response output from the Gemini model.");
    }

    const data = JSON.parse(textOutput);
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Invalid output format returned by the intelligence engine.");
    }

    return NextResponse.json({ success: true, questions: data.questions });
  } catch (err: any) {
    console.error("MCQ generation route error: ", err);
    return NextResponse.json({ error: err.message || "Failed to generate multiple choice quiz" }, { status: 500 });
  }
}
