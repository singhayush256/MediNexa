/**
 * MediNexa Unified API Configuration & Resilient Fetch Helper
 * Handles intelligent host resolution and prevents connection hanging in production.
 */

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  // In browser runtime
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    // If an explicit API URL is provided in env
    if (envUrl && envUrl.length > 0) {
      // If deployed on production domain (e.g. *.vercel.app) but envUrl is pointing to localhost,
      // route via relative proxy to prevent TCP SYN timeouts on client device
      if (!isLocalhost && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        return '/api/v1';
      }
      return envUrl.replace(/\/$/, '');
    }

    // No env variable set in browser:
    // If running in production (Vercel, custom domain), use relative path
    if (!isLocalhost) {
      return '/api/v1';
    }

    // Running locally in development
    return 'http://localhost:3001/api/v1';
  }

  // In server-side runtime (SSR / API routes)
  if (envUrl && envUrl.length > 0) {
    return envUrl.replace(/\/$/, '');
  }

  return 'http://localhost:3001/api/v1';
}

/**
 * Fetch wrapper with built-in timeout to guarantee responses never hang.
 * Default timeout is 8000ms (8 seconds).
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000,
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
