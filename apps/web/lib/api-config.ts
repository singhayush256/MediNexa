/**
 * MediNexa Unified API Configuration & Resilient Fetch Helper
 * Handles intelligent host resolution and prevents connection hanging in production.
 */

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  // If explicit production backend is provided in environment
  if (envUrl && envUrl.length > 0 && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/$/, '');
  }

  // In browser runtime
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    // In production web browsers (e.g. *.vercel.app or custom domains):
    // Direct cross-origin to Render with dynamic CORS support
    if (!isLocalhost) {
      return 'https://medinexa-staging-api.onrender.com/api/v1';
    }

    // Running locally in development
    return 'http://localhost:3001/api/v1';
  }

  // In server-side runtime (SSR / API routes)
  if (envUrl && envUrl.length > 0) {
    return envUrl.replace(/\/$/, '');
  }

  return 'https://medinexa-staging-api.onrender.com/api/v1';
}

/**
 * Fetch wrapper with built-in timeout to guarantee responses never hang.
 * Automatically falls back to the same-origin proxy if cross-origin fetch is blocked.
 * Default timeout is 25000ms (25 seconds) to accommodate serverless/free-tier cold starts.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 25000,
): Promise<Response> {
  let controller: AbortController | null = null;
  let timer: any = null;

  if (typeof AbortController !== 'undefined') {
    controller = new AbortController();
    timer = setTimeout(() => {
      controller?.abort();
    }, timeoutMs);
  }

  const signal = options.signal || controller?.signal;

  try {
    const response = await fetch(url, {
      ...options,
      signal,
    });
    return response;
  } catch (err: any) {
    // If a cross-origin fetch failed (e.g. CORS block, network error), transparently fallback to same-origin /api/v1 proxy
    if (
      typeof window !== 'undefined' &&
      url.includes('/api/v1/') &&
      !url.startsWith('/') &&
      !url.startsWith(window.location.origin)
    ) {
      try {
        const fallbackPath = '/api/v1/' + url.split('/api/v1/')[1];
        const fallbackResponse = await fetch(fallbackPath, {
          ...options,
          signal,
        });
        return fallbackResponse;
      } catch {
        // Fall through to throw standard error below
      }
    }

    if (err.name === 'AbortError' || err.message?.includes('aborted')) {
      throw new Error(
        `Request to ${url} timed out after ${timeoutMs / 1000}s. Please verify your connection or try again.`,
      );
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
