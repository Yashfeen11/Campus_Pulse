import { MODEL_FALLBACK_CHAIN } from '@/lib/constants';

/**
 * Interface representing a multimodal content part for Gemini REST API
 */
export interface GeminiContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

/**
 * Parameters for executing a Gemini API request with auto-fallback
 */
export interface GeminiRunnerParams {
  contents: Array<{
    parts: GeminiContentPart[];
  }>;
  systemInstruction?: string;
  responseSchema?: Record<string, unknown>;
  responseMimeType?: string;
}

/**
 * Return type indicating extracted text and successful model
 */
export interface GeminiRunnerResult {
  text: string;
  modelUsed: string;
}

/**
 * Executes a Gemini generative request over the prioritized fallback chain
 * Returns parsed text result or null to delegate to local parser
 */
export async function runGeminiWithFallback(
  params: GeminiRunnerParams
): Promise<GeminiRunnerResult | null> {
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    '';

  const apiKey = rawKey.replace(/^\[|\]$/g, '').trim();

  if (!apiKey) {
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
    } catch {
      // Gracefully continue to next model in fallback chain
    }
  }

  return null;
}
