export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ ok: boolean; status: number; data?: T; message?: string }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    let url = endpoint;
    if (!endpoint.startsWith('http')) {
      if (endpoint.startsWith('/api/v1')) {
        url = `${baseUrl}${endpoint.replace('/api/v1', '')}`;
      } else if (endpoint.startsWith('/')) {
        url = `${baseUrl}${endpoint}`;
      } else {
        url = `${baseUrl}/${endpoint}`;
      }
    }

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('medinexa_token') || localStorage.getItem('token')
        : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    let responseData: any = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const textContent = await response.text();
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          message: 'Unable to connect to MediNexa API.',
        };
      }
      responseData = textContent;
    }

    if (!response.ok) {
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
    return {
      ok: false,
      status: 500,
      message: err.message || 'Unable to connect to MediNexa API.',
    };
  }
}
