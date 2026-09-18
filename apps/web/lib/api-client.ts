import { getApiBaseUrl, fetchWithTimeout } from './api-config';

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<{ ok: boolean; status: number; data?: T; message?: string }> {
  const maxRetries = options.retries ?? 1;
  const timeoutMs = options.timeoutMs ?? 45000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const baseUrl = getApiBaseUrl();

      let url = endpoint;
      if (!endpoint.startsWith('http')) {
        if (endpoint.startsWith('/api/v1')) {
          url = baseUrl.endsWith('/api/v1')
            ? `${baseUrl}${endpoint.replace('/api/v1', '')}`
            : `${baseUrl}${endpoint}`;
        } else if (endpoint.startsWith('/')) {
          url = `${baseUrl}${endpoint}`;
        } else {
          url = `${baseUrl}/${endpoint}`;
        }
      }

      let token: string | null = null;
      if (typeof window !== 'undefined') {
        token =
          localStorage.getItem('medinexa_token') ||
          localStorage.getItem('token') ||
          (typeof document !== 'undefined'
            ? document.cookie.match(/medinexa_token=([^;]+)/)?.[1] || null
            : null);
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const { timeoutMs: _, retries: __, ...fetchInit } = options;

      const response = await fetchWithTimeout(
        url,
        {
          ...fetchInit,
          headers,
        },
        timeoutMs,
      );

      const contentType = response.headers.get('content-type') || '';
      let responseData: any = null;

      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const textContent = await response.text();
        if (!response.ok) {
          // If server is 503 or 502 (e.g. Render waking up), retry if attempts remain
          if ((response.status === 502 || response.status === 503) && attempt < maxRetries) {
            await new Promise((res) => setTimeout(res, 2000));
            continue;
          }
          return {
            ok: false,
            status: response.status,
            message: 'Unable to connect to MediNexa API.',
          };
        }
        responseData = textContent;
      }

      if (!response.ok) {
        if ((response.status === 502 || response.status === 503) && attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, 2000));
          continue;
        }
        const errMsg =
          responseData?.message || responseData?.error || 'Unable to connect to MediNexa API.';
        return {
          ok: false,
          status: response.status,
          message: Array.isArray(errMsg) ? errMsg.join(', ') : errMsg,
        };
      }

      return {
        ok: true,
        status: response.status,
        data: responseData as T,
      };
    } catch (err: any) {
      if (attempt < maxRetries && (err.name === 'AbortError' || err.message?.includes('timed out'))) {
        await new Promise((res) => setTimeout(res, 2000));
        continue;
      }
      return {
        ok: false,
        status: 500,
        message: err.message || 'Unable to connect to MediNexa API.',
      };
    }
  }

  return {
    ok: false,
    status: 504,
    message: 'Server connection timed out after multiple attempts.',
  };
}
