/**
 * Central Gemini Multi-Model Runner with Resilient Auto-Fallback
 * Calls direct REST endpoints to eliminate SDK version conflicts and gracefully
 * handles 429 quota exhaustion, 402 credit exhaustion, 404 model not found, and 503 overload.
 */

export const MODEL_FALLBACK_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
];

export interface GeminiContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiRunnerParams {
  contents: Array<{
    parts: GeminiContentPart[];
  }>;
  systemInstruction?: string;
  responseSchema?: Record<string, unknown>;
  responseMimeType?: string;
}

export interface GeminiRunnerResult {
  text: string;
  modelUsed: string;
}

export async function runGeminiWithFallback(
  params: GeminiRunnerParams
): Promise<GeminiRunnerResult | null> {
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    '';

  const apiKey = rawKey.replace(/^\[|\]$/g, '').trim();

  if (!apiKey) {
    console.warn('[Gemini Runner] No GEMINI_API_KEY found. Falling back to local extractor.');
    return null;
  }

  const payload: Record<string, unknown> = {
    contents: params.contents,
    generationConfig: {
      responseMimeType: params.responseMimeType || 'application/json',
      ...(params.responseSchema ? { responseSchema: params.responseSchema } : {}),
    },
  };

  if (params.systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: params.systemInstruction }],
    };
  }

  // Iterate over prioritized model fallback chain
  for (const model of MODEL_FALLBACK_CHAIN) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const text =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ||
          '';

        if (text.trim()) {
          return {
            text: text.trim(),
            modelUsed: model,
          };
        }
      }

      // Log specific HTTP status warning and proceed to next model in chain
      const errorBody = await res.text().catch(() => '');
      console.warn(
        `[Gemini Runner] Model ${model} returned HTTP ${res.status}. Falling back to next available model. (${errorBody.slice(0, 100)})`
      );
    } catch (networkError) {
      console.warn(`[Gemini Runner] Network error calling ${model}:`, networkError);
    }
  }

  console.warn(
    '[Gemini Runner] All models in fallback chain were unavailable. Gracefully delegating to local extractor.'
  );
  return null;
}
