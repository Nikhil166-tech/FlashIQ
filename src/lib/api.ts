import type { FailureScenario } from '../types/result';

export interface GenerateApiResponse {
  raw: any;
  isMock?: boolean;
  provider?: string;
}

const REQUEST_TIMEOUT_MS = 20000; // 20s timeout limit

/**
 * Sends prompt to the Node.js backend proxy.
 * Note: Never calls LLM APIs directly from the browser to keep API keys secure.
 */
export async function callGenerateApi(
  prompt: string, 
  scenario: FailureScenario = 'none',
  signal?: AbortSignal
): Promise<GenerateApiResponse> {
  const controller = new AbortController();
  
  // Timeout timer to prevent silent hanging
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  // If external signal fires (e.g. user cancelled or superseded), abort too
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        scenario,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Server error (Status ${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.error) {
          errorMessage = errJson.error;
        }
      } catch {
        // Raw text or HTML error page
      }
      throw new Error(errorMessage);
    }

    const json = await response.json();
    return json;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The AI model or server took too long to respond.');
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Could not reach backend proxy. Please make sure the server is running on port 3001.');
    }

    throw error;
  }
}
